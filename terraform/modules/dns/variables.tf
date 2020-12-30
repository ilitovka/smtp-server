
variable "domain_name_zone" {}
variable "app_domain_name" {}
variable "environment" {}

variable "lb-mail" {}
variable "dns_record_ttl" {
  default = "60"
}

variable "region" {}

variable "common_tags" {
  type = map
  default = {
    CostDims = "pr:OCE-S c:shared e:pdo p:io"
  }