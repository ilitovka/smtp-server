
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

variable "ecr_image_url" {}


variable "account_id" {}
variable "region" {}

variable "environment" {}
variable "app" {}


variable "ecs_security_group" {}
variable "redis_security_group" {}


variable "private_subnets" {}
variable "lb_target_group" {}
variable "lb_listener" {}

variable "config_service_api_key" {}
variable "config_service_url" {}
variable "crypto_key" {}
variable "crypto_algo" {}
variable "sf_api_endpoint" {}
variable "common_tags" {
  type = "map"
  default = {
    CostDims = "pr:OCE-S c:shared e:pdo p:io"
  }