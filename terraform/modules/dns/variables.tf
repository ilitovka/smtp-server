
variable "domain_name_zone" {}
variable "app_domain_name" {}
variable "environment" {}

variable "lb-mail" {}
variable "dns_record_ttl" {
  default = "60"
}

variable "region" {}
