
variable "aws_ecr_image_tag" {
}

variable "ecs_task_cpu" {
  default = 1024
}

variable "ecs_task_memory" {
  default = 2048
}

variable "autoscale_enabled" {
  default = "false"
}

variable "ecs_autoscale_min_instances" {
  default = "1"
}

variable "ecs_autoscale_max_instances" {
  default = "8"
}

variable "autoscaling_cpu_target_value" {
  default = "75"
}

variable "app" {
  default = "oce-ics"
}

variable "app_domain_name" {}

variable "domain_name_zone" {}

variable "az_count" {
  default = "2"
}


