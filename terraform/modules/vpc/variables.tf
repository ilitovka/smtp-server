variable "cidr_block" {}
variable "az_count" {
    default = 2
}
variable "environment" {}
variable "app" {}
variable "common_tags" {
  type = map(string)
  default = {
    "CostDims" = "pr:OCE-S c:shared e:pdo p:io"
  }
}