

# Fetch availability zones in the current region.
data "aws_availability_zones" "available" {}

resource "aws_vpc" "main" {
  cidr_block = "10.3.0.0/16"

  tags = {
    Name = "oce-ics-${terraform.workspace}"
  }
}

locals {
  base_cidr              = aws_vpc.main.cidr_block
  cidr_block_public_ecs  = cidrsubnet(local.base_cidr, 4, 1)
  cidr_block_private_ecs = cidrsubnet(local.base_cidr, 4, 2)
  netnum_private_db      = cidrsubnet(local.base_cidr, 4, 3)
}

# Create private subnets for each availability zone.
resource "aws_subnet" "private" {
  count             = var.az_count
  cidr_block        = cidrsubnet(local.cidr_block_private_ecs, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.main.id

  tags = {
    Name = "oce-ics-${terraform.workspace} - Private ${count.index + 1}"
  }

}

# Create public subnets for each availability zone.
resource "aws_subnet" "public" {
  count                   = var.az_count
  cidr_block              = cidrsubnet(local.cidr_block_public_ecs, 4, count.index)

  availability_zone       = data.aws_availability_zones.available.names[count.index]
  vpc_id                  = aws_vpc.main.id
  map_public_ip_on_launch = true

  tags = {
    Name = "oce-ics-${terraform.workspace} - Public ${count.index + 1}"
  }
}

# Create RDS subnets (private) for each availability zone.
resource "aws_subnet" "rds" {
  count             = var.az_count
  cidr_block        = cidrsubnet(local.netnum_private_db, 4, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  vpc_id            = aws_vpc.main.id

  tags = {
    Name = "oce-ics-${terraform.workspace} - RDS ${count.index + 1}"
  }
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "oce-ics-ig-${terraform.workspace}"
  }
}

resource "aws_eip" "gw" {
  count      = var.az_count
  vpc        = true
  depends_on = [aws_internet_gateway.gw]

  tags = {
    Name = "oce-ics-eip-${terraform.workspace}"
  }
}

resource "aws_nat_gateway" "gw" {
  count         = var.az_count
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.gw.*.id, count.index)

  tags = {
    Name = "oce-ics-ng-${terraform.workspace}"
  }
}

# Create a new route table for the private subnets.
# And make it route non-local traffic through the NAT gateway to the internet.
resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gw.*.id, count.index)
  }

  tags = {
    Name = "oce-ics-rt-${terraform.workspace}-private-${count.index + 1}"
  }
}

# Explicitely associate the newly created route tables to the private subnets (so they don't default to the main route table).
resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

resource "aws_route_table" "public" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "oce-ics-rt-${terraform.workspace}-public-${count.index + 1}"
  }
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.public.*.id, count.index)
  route_table_id = element(aws_route_table.public.*.id, count.index)
}

# Create a new route table for the RDS subnets.
# And make it route non-local traffic through the NAT gateway to the internet.
resource "aws_route_table" "rds" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gw.*.id, count.index)
  }

  tags = {
    Name = "oce-ics-rt-${terraform.workspace}-rds-${count.index + 1}"
  }
}

# Explicitely associate the newly created route tables to the RDS subnets (so they don't default to the main route table).
resource "aws_route_table_association" "rds" {
  count          = var.az_count
  subnet_id      = element(aws_subnet.rds.*.id, count.index)
  route_table_id = element(aws_route_table.rds.*.id, count.index)
}


resource "aws_security_group" "ecs_lb" {
  name        = "${var.app}-${terraform.workspace}-ecs-lb"
  description = "Allow HTTP/HTTPs and MAIL inbound traffic"
  vpc_id      = aws_vpc.main.id


  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 25
    to_port     = 25
    protocol    = "tcp"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  tags = {
    Name = "oce-ics-sg-${terraform.workspace}-public"
  }
}

# Traffic to the ECS Cluster should only come from the load balancer.
resource "aws_security_group" "ecs_tasks" {
  name        = "ecs-tasks"
  description = "allow inbound access from the ALB only"
  vpc_id      = aws_vpc.main.id

  ingress {
    protocol        = "tcp"
    from_port       = "8888"
    to_port         = "8888"
    security_groups = ["${aws_security_group.ecs_lb.id}"]
  }

  # For Network Load Balancer the trafic must be filtered in the target SG (here)
  # No reference to NLB security group because it does not have such
  ingress {
    protocol        = "tcp"
    from_port       = "25"
    to_port         = "25"
    cidr_blocks     = ["0.0.0.0/0"]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

 tags = {
    Name = "oce-ics-sg-${terraform.workspace}-private"
  }
}

### Load balancer.
resource "aws_lb" "api" {
  name            = "oce-ics-api-alb-${terraform.workspace}"

  load_balancer_type = "application"

  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.ecs_lb.id]

  tags = {
    Name = "oce-ics-alb-${terraform.workspace}"
  }
}

# Redirect all traffic from the load balancer to the target group.
resource "aws_alb_listener" "http" {
  load_balancer_arn = aws_lb.api.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.cert.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_target_group" "api" {
  name        = "oce-ics-api-tg-${terraform.workspace}"
  port        = 8888
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    interval            = 30
    path                = "/health"
    port                = 8888
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    protocol            = "HTTP"
    matcher             = "200"
  }

}


# Mail Load Balancer
resource "aws_lb" "mail" {
  name            = "oce-ics-mail-nlb-${terraform.workspace}"
  load_balancer_type = "network"

  subnets         = aws_subnet.public.*.id

  tags = {
    Name = "oce-ics-alb-${terraform.workspace}"
  }
}

# Redirect all traffic from the load balancer to the target group.
resource "aws_alb_listener" "mail" {
  load_balancer_arn = aws_lb.mail.id
  port              = "25"
  protocol          = "TCP"


  default_action {
    target_group_arn = aws_lb_target_group.mail.id
    type             = "forward"
  }
}

resource "aws_lb_target_group" "mail" {
  name        = "oce-ics-mail-tg-${terraform.workspace}"
  port        = 25
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    interval            = 30
    port                = 25
    healthy_threshold   = 3
    unhealthy_threshold = 3
    protocol            = "TCP"
  }
}