

variable "container_env_vars" {
    type = list(object({
        name = string
        value = string
    }))
}

variable "container_image" {
	default = "694723881910.dkr.ecr.us-east-2.amazonaws.com/oce-ics-api:qa"
}

variable "awslogs_group" {
  default = "/ecs/oce-ics-api"
}

variable "ecs_service_subnets" {
  default = ["subnet-06265c18673dac117", "subnet-0c0d47f9eabd7ed9a"]
}

variable "ecs_service_security_groups" {
  default = ["sg-0e53c67b445ba833c"]
}

variable "ecs_task_cpu" {
  default = 1024
}

variable "ecs_task_memory" {
  default = 2048
}

variable "environment" {
  default = "qa"
}

variable "aws_region" {
  default = "us-east-2"
}

variable "vpc_id" {
  default = "vpc-01cf39774734e85f6"
}




