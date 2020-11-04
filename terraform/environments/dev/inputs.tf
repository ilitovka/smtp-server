variable "aws_ecr_image_tag" {}

variable "app" {}
variable "app_domain_name" {}
variable "domain_name_zone" {}

variable "environment" {}
variable "account_id" {}
variable "region" {}
variable "vpc_cidr_block" {}
variable "failover_primary_region" {
  default = null
}


variable "config_service_api_key" {}
variable "config_service_url" {}
variable "crypto_key" {}
variable "crypto_algo" {}
variable "sf_api_endpoint" {}