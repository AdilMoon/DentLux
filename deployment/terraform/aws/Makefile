TF ?= terraform

.PHONY: init init-remote fmt validate plan apply destroy output

init:
	$(TF) init

init-remote:
	$(TF) init -backend-config=backend.hcl

fmt:
	$(TF) fmt -recursive

validate:
	$(TF) validate

plan:
	$(TF) plan -var-file=terraform.tfvars

apply:
	$(TF) apply -var-file=terraform.tfvars

destroy:
	$(TF) destroy -var-file=terraform.tfvars

output:
	$(TF) output
