
resource "random_password" "password" {
  length = 16
  special = true
  override_special = "_%@"
}

resource "aws_db_instance" "default" {
  identifier = "oce-ics-db-${local.environment}"

  availability_zone = data.aws_availability_zones.available.names[0]

  allocated_storage    = 20
  max_allocated_storage = 100

  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "11.5"
  instance_class       = "db.t2.micro"

  name                 = "oceicsdb"
  username             = "dbmaster"
  password             = random_password.password.result
  
  parameter_group_name = "default.postgres11"

  db_subnet_group_name = aws_db_subnet_group.default.id
  vpc_security_group_ids = [aws_security_group.postgres.id]

  deletion_protection = true
}

resource "aws_db_subnet_group" "default" {
  name       = "oce-db-subnet-${terraform.workspace}"
  subnet_ids = aws_subnet.rds.*.id

  tags = {
    Name = "My DB subnet group"
  }
}

resource "aws_security_group" "postgres" {
  name        = "oce-postgres-sg-${terraform.workspace}"

  description = "allow inbound access to Postgres"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = "5432"
    to_port         = "5432"
    cidr_blocks     = [aws_vpc.main.cidr_block]
  }

  ingress {
    protocol        = "tcp"
    from_port       = "5432"
    to_port         = "5432"
    cidr_blocks     = ["195.60.71.135/32"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

 tags = {
    Name = "oce-ics-db-sg-${terraform.workspace}-private"
  }
}

# data "aws_db_instance" "database" {
#   db_instance_identifier = aws_db_instance.default.id

#   depends_on = [aws_db_instance.default]
# }

resource "aws_ssm_parameter" "db_host" {
  name  = "/oce/${local.environment}/ics/DB_HOST"
  type  = "String"
  value = aws_db_instance.default.address
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/oce/${local.environment}/ics/DB_NAME"
  type  = "String"
  value = aws_db_instance.default.name
}

resource "aws_ssm_parameter" "db_user" {
  name  = "/oce/${local.environment}/ics/DB_USER"
  type  = "String"
  value = aws_db_instance.default.username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/oce/${local.environment}/ics/DB_PASSWORD"
  type  = "SecureString"
  value = random_password.password.result
}


