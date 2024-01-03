---
categories: ["iac"]
date: 9/14/2023
image: ./images/iac-p4/gcp-v-pulumi.png
title: Infrastructure-as-Code (IaC) Tooling Comparison - Part 4
description: Comparison of between GCP Deployment Manager and Pulumi and final thoughts on IaC tooling options
---

Welcome to this final entry in the Infrastructure-as-Code (IaC) tooling comparison series of posts, in this entry we will focus on [Google Cloud Deployment Manager](https://cloud.google.com/deployment-manager/docs) and [plumi](https://www.pulumi.com/product/).

To recap: in <a href="/blog/iac-p1">part 1</a> we reviewed [Terraform](https://www.terraform.io/) and [Terraform CDK](https://github.com/hashicorp/terraform-cdk), in <a href="/blog/iac-p2"> part 2</a> we reviewed [Azure Resource Manager (ARM)](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview) and [Azure Bicep](https://devblogs.microsoft.com/devops/project-bicep-next-generation-arm-templates/). In our <a href="/blog/iac-p3">third entry</a> we compared [AWS Cloud Formation](https://aws.amazon.com/cloudformation/) and [AWS CDK](https://aws.amazon.com/cdk/).  

# Google Cloud Deployment Manager

What is Google Cloud Deployment Manager you may ask..
well it is Google Cloud's native infrastructure deployment service. This service automates the provisioning and management of Google Cloud resources, such as Cloud Storage and Compute Engine Instances, as a single unit called a _deployment_. 

For example, if your team's development environment needs two virtual machines (VMs) and a BigQuery database, you can define these resources in a configuration file, and use Deployment Manager to create, change, or delete these resources. You can make the configuration file part of your team's code repository, so that anyone can create the same environment with consistent results.

## Components

The deployment manager is broken into serveral key components: _Configuration_, _Templates_, _Schemas_, and _Manifest_. 

### Configuration
A configuration is a file written using YAML syntaxt that describes all the resources you want for a single deployment. It lists each of the resources you want to create and its respective resource properties. A configuration must contain a `resources:` section followed by the list of resources to create.

Each resource must contain three components:
    * `name` - A user-defined string to identify this resource such as my-vm, project-data-disk, the-test-network.
    * `type` - The type of the resource being deployed such as compute.v1.instance, compute.v1.disk. The base resource types are described and listed on the [Supported Resource Types](https://cloud.google.com/deployment-manager/docs/configuration/supported-resource-types) documentation.
    * `properties` - The parameters for this resource type. They must match the properties for the type such as zone: asia-east1-a, boot: true.

A resource represents a single API resource. This can be an API resource provided by a Google-managed base type or an API resource provided by a Type Provider. For example, a Compute Engine instance is a single resource, a Cloud SQL instance is a single resource, and so on.

The following is an example configuration:

```
resources:
- name: the-first-vm
  type: compute.v1.instance
  properties:
    zone: us-central1-a
    machineType: https://www.googleapis.com/compute/v1/projects/myproject/zones/us-central1-a/machineTypes/f1-micro
    disks:
    - deviceName: boot
      type: PERSISTENT
      boot: true
      autoDelete: true
      initializeParams:
        sourceImage: https://www.googleapis.com/compute/v1/projects/debian-cloud/global/images/debian-7-wheezy-v20150423
    networkInterfaces:
    - network: https://www.googleapis.com/compute/v1/projects/myproject/global/networks/default
      accessConfigs:
      - name: External NAT
        type: ONE_TO_ONE_NAT
```

### Templates

A configuration can contain _templates_ which are smaller parts of a larger configuration file written in either Python or Jinja2 that have been abstracted into individual resuable building blocks that can be used across deployments. 

The following is a sample of a template file:

```
imports:
- path: vm_template.jinja

resources:
- name: vm-instance
  type: vm_template.jinja
  properties:
    zone: us-central1-a
    project: myproject
```

Templates provide much more flexibility than individual configuration files and are intended to support easy portability across deployments.

The Deployment Manager system will interpret each template recursively and inline the results within the configuration file. As such, the interpretation of each template eventually results in the same YAML syntax for resources as that defined above for the configuration file itself.

One or more templates that are preconfigured to work together can be combined into a special type called a _composite type_ contains one or more templates . 

Composite types are hosted templates that can be added to Deployment Manager. Typically you create composite types for common solutions/scenerios so that the solution is easily reusable, or create complex setups that you can reuse in the future.

Composite types can be referenced using the following syntax:

```
resources:
- name: my-composite-type
  type: myproject/composite:example-composite-type
```

However as of this writing composite types are no longer supported in Deployment Manager, see the [following](https://cloud.google.com/deployment-manager/docs/deprecations/composite-types) for more details.

### Schemas

A schema effectively describes the specifications of a Deployment Manager template. If a schema exists for a template, Deployment Manager uses the schema to enforce how users can interact with the corresponding template. Schemas define a set of rules that a configuration file must meet if it wants to use a particular template. 

Schemas are similar to terraform variables.

Schemas also allow your users to interface with the templates you write, without needing to review and learn about each layer of templates. By simply reviewing the requirements defined in your schema users can learn what properties are settable or required for the respective template.


Example schema definition:

```
info:
  title: VM with startup script
  author: David Tessier
  description: Creates a disk running the provided startup script.

required:
- zone
- startup-script

properties:
  zone:
    description: Zone to create the resources in.
    type: string

  startup-script:
    description: The startup script to run on VM intialization.
    type: string
```

### Manifest

Another fundamental component of GCP's Deployment Manager Services is something called a _manifest_ which is a read-only object that contains the original configuration you provided. It includes any imported templates, and also contains the fully-expanded resource list, created by Deployment Manager. 

Each time a deployment is updated, Deployment Manager generates a new manifest file which reflects the new state of the deployment. This file can is usefule when troubleshooting issues with a deployment.

In comparision to terraform think of the _manifest_ as the terraform state file, you just dont have to manage this as its entirely managed by the service.

Visit the google cloud documentation on [manifest](https://cloud.google.com/deployment-manager/docs/deployments/viewing-manifest) to view a sample of what the manifest looks like.

There is also a [full migration guide](https://cloud.google.com/deployment-manager/docs/migrations/composite-types) to migrate composite types to supported templates.

## Deployment Process

Once you have written your configuration file, sample can be found in the following [github repository](https://github.com/DavidDTessier/iac-tools-samples/tree/main/GCP_Native/Deployment%20Manager) you need to leverage the Google Cloud CLI (`gcloud deployment-manager deployments`) command to run the deployment.

Example:

```
gcloud deployment-manager deployments create web-server-1 --config web-server.yaml 
```

When the above command completes the output should like like the following:

```
The fingerprint of the deployment is b'90FShygQGT0mofU4UK5Q0A=='
Waiting for create [operation-1675426931850-5f3cabb1ebb26-55d56a21-67f3a8e2]...
done.                                                                          
Create operation operation-1675426931850-5f3cabb1ebb26-55d56a21-67f3a8e2 completed successfully.
NAME                  TYPE                 STATE      ERRORS  INTENT
web-server-1-web1-vm  compute.v1.instance  COMPLETED  []
```

To update an existing deployment use the `gcloud deployment-manager deployments update` command.

To delete an existing deployment and all resources provisioned as part of the deployment use the `gcloud deployment-manager deployments delete`, as shown below:

```
gcloud deployment-manager deployments delete web-server-1
```

Once complete the output will display something similar:

```
The following deployments will be deleted:
- web-server-1

Do you want to continue (y/N)?  y

Waiting for delete [operation-1675427504102-5f3cadd3a9cec-ad1707d8-f67f5e25]...
done.                                                                          
Delete operation operation-1675427504102-5f3cadd3a9cec-ad1707d8-f67f5e25 completed successfully.
```

You can also view the deployment and its details in Google Cloud Console.


## Thoughts

What is nice about deployment manager it is native to GCP so any time new API become available its automatically supported. Also there is no need to manage state seperately, unlike terraform, as its generated and re-generated on every update.

However the downside of using native tooling is that if you are managing a multi-cloud environment, ie using more than one cloud service provider (CSP), than you will need to switch the tooling you use for each CSP. 

This is where our final IaC tool comes into play, similar to tools like terraform, it can be used to manage resources across CSPs.

For more information, see: https://cloud.google.com/deployment-manager/docs/

For Cloud Deployment Manager best practices, see: https://cloud.google.com/deployment-manager/docs/best-practices

# Pulumi

[Pulumi](https://www.pulumi.com/), similar to terraform, is a universal and open source platform that allow users to provision and managed infrastructure as code on any cloud, such as GCP, AWS, and Azure to name a few. 

Similar to terraform, Pulumi offers a model where the desired state infrastructure is represented as code and the deployment engine compares this desired state with the stack’s current state and determines what resources need to be created, updated or deleted.

However traditional terraform, pulumi allows for developing infrastructure code using familiar general purpose languages like Python, Typescript, JavaScript, Go, .NET, JAVA, as well as markup languages such as YAML. With this in-mind Pulumi is more similar to terraform's CDKTF offering, however it is more established over CDKTF.

## Pulumi Architecture Overview

The following diagram, which is sourced from the official [Pulumi Documentation](https://www.pulumi.com/docs/intro/concepts/#overview), outlines the strucuture and major components of Pulumi.

![Pulumi Overview](https://www.pulumi.com/images/docs/pulumi-programming-model-diagram.svg)

At a high-level Pulumi is made up of the following components:

* _Project_:
  - A directory containing the source code for the project and metadata to make the program run
* _Program_:
  - An executable written in a supported general purpose language, which describes the composition of your cloud infrastructure
  - Resides in a project directory
* _Resource(s)_:
  - Fundamental unit that make up the cloud infrastructure, example compute instance or storage bucket
* _Stack(s)_:
  - An isolated, independently configurable instance of a program (such as dev, staging, prod, etc)
  - Every Pulumi program is deployed into a "stack"


## Setup and Getting Started

Before you can starting using Pulumi, you first need to install the sdk. Installation details for macOS, Windows, and Linus OS based systems can be found [here](https://www.pulumi.com/docs/get-started/gcp/begin/#install-pulumi)

As mentioned above Pulumi supports many general purpose programming languages, details for setting each up can be found [here](https://www.pulumi.com/docs/get-started/gcp/begin/#choose-your-language).

In this demo I will focus on Google Cloud but Pulumi also supports [Azure](https://www.pulumi.com/docs/get-started/azure), [AWS](https://www.pulumi.com/docs/get-started/aws), [Kubernetes](https://www.pulumi.com/docs/get-started/kubernetes), as well as 70+ plus other providers which can be found in there [registry](https://www.pulumi.com/registry/)

The open-source Pulumi CLI works in tandem with the [Pulumi Service](https://www.pulumi.com/docs/intro/pulumi-service/), which is a web platform that manages deployment states and enables collaboration between developers and operators. The CLI automatically leverages the Pulumi Service unless and [self-managed backend](https://www.pulumi.com/docs/intro/concepts/state/) is configure

Using the following _[Get Started](https://www.pulumi.com/docs/intro/pulumi-service/#getting-started)_ walkthrough to create and configure a free account.

This demo will leverage the default Pulumi Service as the state storage and assumes that your have an account configured properly.


First step is to setup you GCP credentials by running the following `gcloud` command:

```
$ glcoud auth application-default login
```

Next week need to bootstrap our Pulumi project, to do so we run the following commands:

```
$ pulumi new gcp-go
```

If this is the first time using the CLI you will be required to enter your Pulumi Service Access token:

```

Enter your access token from https://app.pulumi.com/account/tokens
    or hit <ENTER> to log in using your browser                   : 


  Welcome to Pulumi!

  Pulumi helps you create, deploy, and manage infrastructure on any cloud using
  your favorite language. You can get started today with Pulumi at:

      https://www.pulumi.com/docs/get-started/

  Tip: Resources you create with Pulumi are given unique names (a randomly
  generated suffix) by default. To learn more about auto-naming or customizing resource
  names see https://www.pulumi.com/docs/intro/concepts/resources/#autonaming.

```

Once the CLI validates the access it will ask for a project name to name the code project:
```
$ project name: (Pulum) demo
```

Next the CLI will ask for the _Stack_ name:

```
Please enter your desired stack name.
To create a stack in an organization, use the format <org-name>/<stack-name> (e.g. `acmecorp/dev`).
$ stack name: (dev) 
```

Next we need to configure the Pulumi cli to interact with your Google Cloud Project by running the following command:

```
$ pulumi config set gcp:project _YOUR_PROJECT_ID_
```

Now that your environment is configured lets dive into the code. The following is the basic structure of the project (current example is Go):

![Go Pulumi Folder Strucuture](/images/pulumi-folder-structure.png)

* _main.go_ is the file containing the main source code
* _Pulumi.yaml_ is configuration file for the project
* _Pulumi.dev.yaml_ is the contains the configuration values for the stack that was initialized

Let's look at _main.go_:

```
package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create a GCP resource (Storage Bucket)
		bucket, err := storage.NewBucket(ctx, "my-bucket", &storage.BucketArgs{
			Location: pulumi.String("US"),
		})
		if err != nil {
			return err
		}

		// Export the DNS name of the bucket
		ctx.Export("bucketName", bucket.Url)
		return nil
	})
}
```

As you see we are creating a storage bucket using the `storage.NewBucket()` resource as well as exporting the _bucketName_ using the `ctx.Export()` method.

To test the provision your run the `$ pulumi up` command which will generate a state file like the one below:

```
Previewing update (dev)

View Live: https://app.pulumi.com/dt-demo/demo/dev/previews/ecd92378-31a2-4dfa-8d12-8caa6b192184

Downloading plugin gcp v6.51.0: 45.93 MiB / 45.93 MiB [=============] 100.00% 8s
     Type                   Name       Plan       
 +   pulumi:pulumi:Stack    demo-dev   create     
 +   └─ gcp:storage:Bucket  my-bucket  create     


Outputs:
    bucketName: output<string>

Resources:
    + 2 to create

Do you want to perform this update?  [Use arrows to move, type to filter]
  yes
> no
  details
```

To deploy the bucket use the arrow keys to navigate to `yes` and press `enter` this will provision the storage bucket into the configured GCP project as shown in the following output:

```
Previewing update (dev)

View Live: https://app.pulumi.com/dt-demo/demo/dev/previews/dd85b98c-c98a-4c15-bb84-dac86efb6426

     Type                   Name       Plan       
     pulumi:pulumi:Stack    demo-dev              
 +   └─ gcp:storage:Bucket  my-bucket  create     


Outputs:
  + bucketName: output<string>

Resources:
    + 1 to create
    1 unchanged

Do you want to perform this update? yes
Updating (dev)

View Live: https://app.pulumi.com/dt-demo/demo/dev/updates/2

     Type                   Name       Status           
     pulumi:pulumi:Stack    demo-dev                    
 +   └─ gcp:storage:Bucket  my-bucket  created (1s)     


Outputs:
  + bucketName: "gs://my-bucket-fe63a01"

Resources:
    + 1 created
    1 unchanged

Duration: 5s
```

Success! OK next lets create a webserver as shown following snippet

```
package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/compute"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/serviceaccount"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		// Create a GCP resource (Storage Bucket)
		bucket, err := storage.NewBucket(ctx, "my-bucket", &storage.BucketArgs{
			Location: pulumi.String("US"),
		})

		defaultAccount, err := serviceaccount.NewAccount(ctx, "defaultAccount", &serviceaccount.AccountArgs{
			AccountId:   pulumi.String("service-account-id"),
			DisplayName: pulumi.String("Service Account"),
		})

		computeNetwork, err := compute.NewNetwork(ctx, "my-network",
			&compute.NetworkArgs{
				AutoCreateSubnetworks: pulumi.Bool(true),
			},
		)

		if err != nil {
			return err
		}

		computeFirewall, err := compute.NewFirewall(ctx, "firewall",
			&compute.FirewallArgs{
				Network: computeNetwork.SelfLink,
				Allows: &compute.FirewallAllowArray{
					&compute.FirewallAllowArgs{
						Protocol: pulumi.String("tcp"),
						Ports: pulumi.StringArray{
							pulumi.String("22"),
							pulumi.String("80"),
						},
					},
				},
				SourceRanges: pulumi.StringArray{
					pulumi.String("0.0.0.0/0"),
				},
				SourceTags: pulumi.StringArray{
					pulumi.String("web"),
				},
			},
		)
		if err != nil {
			return err
		}

		// (optional) create a simple web server using the startup script for the instance
		startupScript := `#!/bin/bash
		echo "Hello, World!" > index.html
		nohup python -m SimpleHTTPServer 80 &`

		computeInstance, err := compute.NewInstance(ctx, "instance",
			&compute.InstanceArgs{
				MachineType:           pulumi.String("f1-micro"),
				Zone:                  pulumi.String("us-central1-a"),
				MetadataStartupScript: pulumi.String(startupScript),
				Tags: pulumi.StringArray{
					pulumi.String("foo"),
					pulumi.String("bar"),
				},
				BootDisk: &compute.InstanceBootDiskArgs{
					InitializeParams: &compute.InstanceBootDiskInitializeParamsArgs{
						Image: pulumi.String("debian-cloud/debian-9-stretch-v20181210"),
					},
				},
				NetworkInterfaces: compute.InstanceNetworkInterfaceArray{
					&compute.InstanceNetworkInterfaceArgs{
						Network: computeNetwork.SelfLink,
						// Must be empty to request an ephemeral IP
						AccessConfigs: compute.InstanceNetworkInterfaceAccessConfigArray{
							&compute.InstanceNetworkInterfaceAccessConfigArgs{},
						},
					},
				},
				Metadata: pulumi.StringMap{
					"foo": pulumi.String("bar"),
				},
				ServiceAccount: &compute.InstanceServiceAccountArgs{
					Email: defaultAccount.Email,
					Scopes: pulumi.StringArray{
						pulumi.String("https://www.googleapis.com/auth/cloud-platform"),
					},
				},
			},
			pulumi.DependsOn([]pulumi.Resource{computeFirewall}),
		)
		if err != nil {
			return err
		}

		ctx.Export("instanceName", computeInstance.Name)
		ctx.Export("instanceIP", computeInstance.NetworkInterfaces.Index(pulumi.Int(0)).AccessConfigs().Index(pulumi.Int(0)).NatIp())
		ctx.Export("bucketName", bucket.Url)
		return nil
	})
}
```

Next we re-run the the command `$ pulumi up` to run the latest configuration changes. The output will indicate that it generated/created our resources:

```
% pulumi up  
Previewing update (temp)

View in Browser (Ctrl+O): https://app.pulumi.com/DavidDTessier/demo/temp/previews/f51309ff-fb0e-4eb8-a4f1-fedf9716be7d

     Type                           Name            Plan       
 +   pulumi:pulumi:Stack            demo-temp       create     
 +   ├─ gcp:storage:Bucket          my-bucket       create     
 +   ├─ gcp:compute:Network         my-network      create     
 +   ├─ gcp:serviceAccount:Account  defaultAccount  create     
 +   ├─ gcp:compute:Firewall        firewall        create     
 +   └─ gcp:compute:Instance        instance        create     


Outputs:
    bucketName  : output<string>
    instanceIP  : output<string>
    instanceName: "instance-22fd650"

Resources:
    + 6 to create

Do you want to perform this update? yes
Updating (temp)

View in Browser (Ctrl+O): https://app.pulumi.com/DavidDTessier/demo/temp/updates/5

     Type                           Name            Status            
 +   pulumi:pulumi:Stack            demo-temp       created (79s)     
 +   ├─ gcp:compute:Network         my-network      created (52s)     
 +   ├─ gcp:serviceAccount:Account  defaultAccount  created (1s)      
 +   ├─ gcp:storage:Bucket          my-bucket       created (2s)      
 +   ├─ gcp:compute:Firewall        firewall        created (11s)     
 +   └─ gcp:compute:Instance        instance        created (12s)     


Outputs:
    bucketName  : "gs://my-bucket-a6c7f65"
    instanceIP  : "34.122.4.188"
    instanceName: "instance-b95064b"

Resources:
    + 6 created

Duration: 1m23s
```

Give it a few seconds for the webserver to start up then run the curl command hit the web server:

```
curl http://34.122.4.188
Hello, World!
```

Success!

Delete this Stack's Resources

To delete all cloud resources associated with this stack, run pulumi destroy. Once the stack's resources are deleted, they cannot be recovered.

```
% pulumi destroy -s DavidDTessier/demo/temp
```


Delete this Stack

Deleting this stack will remove it from the Pulumi console, along with all of its update history.

If you wish to delete a stack but not the cloud resources associated with it, you may pass --force to the command-line.

```
% pulumi stack rm DavidDTessier/demo/temp
```

That's it..pretty straight forward. There is still plenty more that can be done using pulumi however I kept this sample fairly light to show the basics.

# Final Thoughts

As a final thought around all the tools I have showcased over this series of posts not matter which tool you use make sure if fits your uses cases. From a multi-cloud perspective both Terraform and Pulumi function relatively the same, however Terraform has become the norm. If you looking at native integrations for a single Cloud you would likely use the native tooling such as Azure Bicep/ARM for Azure or CDK or CloudFormation for AWS as both of those toolsets are in sync with new feature of their respective platforms.

The choice is yours..Happy Coding!
