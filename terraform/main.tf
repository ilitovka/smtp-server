provider "aws" {
  version = "~> 2.0"
  region  = "us-east-2"
}

terraform {
  backend "s3" {
    bucket = "iqvia-oce-terraform-state"
    key    = "services/ics"
    region = "us-east-2"
    dynamodb_table = "iqvia-oce-terraform-state-lock"
  }
}

data "aws_region" "current" {}

data "aws_ecs_task_definition" "task" {
  task_definition = "${aws_ecs_task_definition.task.family}"
}

resource "aws_ecs_cluster" "ics" {
    name = "oce-ics-api"
    capacity_providers = ["FARGATE","FARGATE_SPOT"]
}

# TODO: roles should be defined as resources
resource "aws_ecs_task_definition" "task" {
  family = "oce-ics-api"
  container_definitions = jsonencode(
    [{
      cpu = 0
      environment = var.container_env_vars
      essential = true
      image = var.container_image
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = var.awslogs_group
          awslogs-region = data.aws_region.current.name
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      name = "oce-ics-api"
      portMappings = [{
        containerPort = 8888
        hostPort = 8888
        protocol = "tcp"
      }, {
        containerPort = 25
        hostPort = 25
        protocol = "tcp"
      }]
      volumesFrom = []
    }]
  )
  cpu = var.ecs_task_cpu
  memory = var.ecs_task_memory
  network_mode = "awsvpc"
  task_role_arn = "arn:aws:iam::694723881910:role/ecsTaskExecutionRole"
  execution_role_arn = "arn:aws:iam::694723881910:role/ecsTaskExecutionRole"
  requires_compatibilities = ["FARGATE"]

}

# TODO: VPC should described with subnets, security groups and so on

# resource "aws_vpc" "main" {
#   cidr_block = "10.3.0.0/16"

#   tags = {
#     Name = "oce-ics"
#   }
# }

resource "aws_lb_target_group" "api" {
  name        = "oce-ics-api-tg"
  port        = 8888
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    interval            = 30
    path                = "/health"
    #path                = "/"
    port                = 8888
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
    #matcher             = "401"
  }
}

resource "aws_lb_target_group" "mail" {
  name        = "oce-ics-mail-tg"
  port        = 25
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    interval            = 30
    port                = 25
    healthy_threshold   = 3
    unhealthy_threshold = 3
    protocol            = "TCP"
  }
}

resource "aws_ecs_service" "service" {
  name = "oce-ics-${var.environment}"
  cluster = aws_ecs_cluster.ics.id
  
  # Track the latest ACTIVE revision
  task_definition = "${aws_ecs_task_definition.task.family}:${max("${aws_ecs_task_definition.task.revision}", "${data.aws_ecs_task_definition.task.revision}")}"
  launch_type = "FARGATE"
  desired_count = 1

  platform_version ="LATEST"

  network_configuration {
    assign_public_ip = true
    security_groups  = var.ecs_service_security_groups
    subnets          = var.ecs_service_subnets
  }

  deployment_controller {
    type = "ECS"
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.mail.arn
    container_name   = "oce-ics-api"
    container_port   = 25
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "oce-ics-api"
    container_port   = 8888
  }

  health_check_grace_period_seconds = 0
  tags = {}
}
