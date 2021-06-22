
variable "environment" {}
variable "app_domain_name" {}
variable "app" {}

variable "region" {}

variable "sns2slack_lambda_function_name" {}

variable "sns2slack_lambda_function_arn" {}

variable "ecs_autoscaler_threshold" {}

variable "common_tags" {
  type = map(string)
  default = {
    "CostDims" = "pr:OCE-S c:shared e:pdo p:io"
  }
}