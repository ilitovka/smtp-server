
data "aws_caller_identity" "current" {}

resource "aws_ecs_cluster" "app" {
  name = "${var.app}-${var.environment}"
  #capacity_providers = ["FARGATE","FARGATE_SPOT"]
}


data "template_file" "container" {
  template = file("${path.module}/task-definition.json")

  vars = {
    container_name = var.app
    environment = var.environment
    app_name_slug = replace(var.app, "-", "/")
    image_url = var.ecr_image_url

    region = var.region
    account = var.account_id
    log_group_name = aws_cloudwatch_log_group.logs.name
  }
}

resource "aws_ecs_task_definition" "task" {
  family = "${var.app}-${var.environment}"

  container_definitions = data.template_file.container.rendered

  cpu = var.ecs_task_cpu
  memory = var.ecs_task_memory
  network_mode = "awsvpc"

  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  requires_compatibilities = ["FARGATE"]

}

data "aws_ecs_task_definition" "task" {
  task_definition = aws_ecs_task_definition.task.family
  depends_on = [ aws_ecs_task_definition.task ]
}


resource "aws_ecs_service" "app" {
  name = "${var.app}-${var.environment}"
  cluster = aws_ecs_cluster.app.id
  
  # Track the latest ACTIVE revision
  task_definition = "${aws_ecs_task_definition.task.family}:${max("${aws_ecs_task_definition.task.revision}", "${data.aws_ecs_task_definition.task.revision}")}"
  launch_type = "FARGATE"
  desired_count = 1

  platform_version ="LATEST"

  network_configuration {
    assign_public_ip = false
    security_groups  = [var.security_group.id]
    subnets          = var.private_subnets.*.id
  }

  deployment_controller {
    type = "ECS"
  }

  load_balancer {
    target_group_arn = var.lb_target_group.arn
    container_name   = var.app
    container_port   = 25
  }

  health_check_grace_period_seconds = 30
  tags = {}

  # Optional: Allow external changes without Terraform plan difference
  lifecycle {
    ignore_changes = [desired_count]
  }

  # TODO: remove it
  # workaround for https://github.com/hashicorp/terraform/issues/12634
  depends_on = [var.lb_listener]
}

# https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html
resource "aws_iam_role" "ecsTaskExecutionRole" {
  name = "${var.app}-${var.environment}-${var.region}-ecs"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_role_policy" "params" {
  name = "${var.app}-${var.environment}-params-policy"
  role = aws_iam_role.ecsTaskExecutionRole.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ssm:GetParameters"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:ssm:${var.region}:${var.account_id}:parameter/oce/*"
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecsTaskExecutionRole_policy" {
  role       = aws_iam_role.ecsTaskExecutionRole.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

variable "logs_retention_in_days" {
  type        = number
  default     = 90
  description = "Specifies the number of days you want to retain log events"
}

resource "aws_cloudwatch_log_group" "logs" {
  name              = "/ecs/${var.app}/${var.environment}"
  retention_in_days = var.logs_retention_in_days
  #tags              = var.tags
}