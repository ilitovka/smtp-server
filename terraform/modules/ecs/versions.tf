terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "~> 3.59.0"
    }
    template = {
      source = "hashicorp/template"
    }
  }
  required_version = ">= 0.13"
}
