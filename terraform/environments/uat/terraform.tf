terraform {
  backend "s3" {
    bucket = "iqvia-oce-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-2"
    dynamodb_table = "iqvia-oce-terraform-state-lock"
    workspace_key_prefix = "ics/uat"
  }
}