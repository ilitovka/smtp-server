
data "aws_caller_identity" "current" {}

resource "aws_ecs_cluster" "app" {
  name = "oce-ics-api-${local.environment}"
  #capacity_providers = ["FARGATE","FARGATE_SPOT"]
}


data "template_file" "container" {
  template = "${file("task-definition.json")}"

  vars = {
    container_name = var.app
    environment = "${local.environment}"
    image_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/oce-ics-api:${var.aws_ecr_image_tag}"

    region = local.region
    account = local.account
    log_group_name = "/ecs/${var.app}/${local.environment}"
  }
}

resource "aws_ecs_task_definition" "task" {
  family = "${var.app}-${local.environment}"

  container_definitions = data.template_file.container.rendered

  cpu = var.ecs_task_cpu
  memory = var.ecs_task_memory
  network_mode = "awsvpc"

  execution_role_arn = aws_iam_role.ecsTaskExecutionRole.arn
  requires_compatibilities = ["FARGATE"]

}

data "aws_ecs_task_definition" "task" {
  task_definition = "${aws_ecs_task_definition.task.family}"
  depends_on = [ aws_ecs_task_definition.task ]
}


resource "aws_ecs_service" "app" {
  name = "oce-ics-${local.environment}"
  cluster = aws_ecs_cluster.app.id
  
  # Track the latest ACTIVE revision
  task_definition = "${aws_ecs_task_definition.task.family}:${max("${aws_ecs_task_definition.task.revision}", "${data.aws_ecs_task_definition.task.revision}")}"
  launch_type = "FARGATE"
  desired_count = 1

  platform_version ="LATEST"

  network_configuration {
    assign_public_ip = false
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = aws_subnet.private.*.id
  }

  deployment_controller {
    type = "ECS"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.mail.arn
    container_name   = var.app
    container_port   = 25
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = var.app
    container_port   = 8888
  }

  health_check_grace_period_seconds = 30
  tags = {}

  # Optional: Allow external changes without Terraform plan difference
  lifecycle {
    ignore_changes = [desired_count]
  }

  # workaround for https://github.com/hashicorp/terraform/issues/12634
  depends_on = [aws_alb_listener.https]
}

# https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html
resource "aws_iam_role" "ecsTaskExecutionRole" {
  name = "${var.app}-${local.environment}-ecs"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_role_policy" "params" {
  name = "${var.app}-${local.environment}-params-policy"
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
      "Resource": "arn:aws:ssm:${local.region}:${local.account}:parameter/oce/*"
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
  name              = "/ecs/${var.app}/${local.environment}"
  retention_in_days = var.logs_retention_in_days
  #tags              = var.tags
}