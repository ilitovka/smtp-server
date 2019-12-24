provider "aws" {
  version = "~> 2.0"
  region  = "us-east-2"
}


data "aws_region" "current" {}

# terraform state file setup
# create an S3 bucket to store the state file in
# resource "aws_s3_bucket" "iqvia-oce-terraform-state" {
#     bucket = "iqvia-oce-terraform-state"
 
#     versioning {
#       enabled = true
#     }
 
#     lifecycle {
#       prevent_destroy = true
#     }

#     acl = "private"
    
# }

terraform {
  backend "s3" {
    bucket = "iqvia-oce-terraform-state"
    key    = "services/ics"
    region = "us-east-2"
    dynamodb_table = "iqvia-oce-terraform-state-lock"
  }
}

locals {
  region = data.aws_region.current.name
  account = data.aws_caller_identity.current.account_id
  environment = terraform.workspace
}

# create a dynamodb table for locking the state file
# resource "aws_dynamodb_table" "dynamodb-terraform-state-lock" {
#   name = "terraform-state-lock-dynamo"
#   hash_key = "LockID"
#   read_capacity = 20
#   write_capacity = 20
 
#   attribute {
#     name = "LockID"
#     type = "S"
#   }

# }

