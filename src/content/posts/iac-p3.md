---
categories: ["iac"]
date: 9/27/2022
image: ./images/iac-p3/cdk-v-cloudformation.png
title: Infrastructure-as-Code (IaC) Tooling Comparison - Part 3
description: Comparison of AWS specific IaC tooling
---


In <a href="/blog/iac-p1">part 1</a> and <a href="/blog/iac-p2">part 2</a> we reviewed what infrastructure-as-code tools are as well as the following tools: [Terraform](https://www.terraform.io/) and [Terraform CDK](https://github.com/hashicorp/terraform-cdk).

In this third volume we will continue our disection of IaC tools; this time reviewing will will be focusing on AWS's two native solutions:
* [Cloud Formation](https://aws.amazon.com/cloudformation/)
* [AWS CDK](https://aws.amazon.com/cdk/)

# AWS CloudFormation

## What is CloudFromation

_CloudFormation_ or typically referred to as _CF_ for short is AWS's native tooling for deploying and managing of services/infrastructure within its cloud environment.

It provides a centralized management layer that allows users to create, update, and delete resources in your Azure account using Azure tools, APIs, or SDKs.

Within _CloudFormation_ there are three main concepts that exist which are as _templates_, _stacks_, and _change sets_. The following section outlines these in detail.

**Templates**
This is a _CloudFormation_ file that contains your infrastructure and is a JSON or YAML formatted text file. It can have an extension of `.json`, `.yaml`, `.template`, or `.txt`. _CloudFormation_ uses these templates as blueprints for building resources (such EC2) in your AWS environment. They also allow for building complex sets of resources and and can be reused.

The following samples, simplified for brevity, shows what a _CloudFormation_ template looks like in JSON and YAML.
The full samples can be found on my github repo [here](https://github.com/DavidDTessier/iac-tools-samples/tree/main/AWS_Native/CloudFormation).

_CloudFormation_ JSON template:

```
{
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "A WebServer AWS template template",
    "Resources": {
      "VPC": {
          "Type": "AWS::EC2::VPC",
          "Properties": {
              "EnableDnsSupport": "true",
              "EnableDnsHostnames": "true",
              "CidrBlock": "10.0.0.0/16"
          },
          "Metadata": {
              "AWS::CloudFormation::Designer": {
                  "id": "41b7e114-3c91-478b-bfe8-1c40e7060e2d"
              }
          }
      },
      ...
      "WebServerInstance": {
          "Type": "AWS::EC2::Instance",
          "Properties": {
              "InstanceType": {
                  "Ref": "InstanceType"
              },
              "ImageId": {
                  "Fn::FindInMap": [
                      "AWSRegionArch2AMI",
                      {
                          "Ref": "AWS::Region"
                      },
                      {
                          "Fn::FindInMap": [
                              "AWSInstanceType2Arch",
                              {
                                  "Ref": "InstanceType"
                              },
                              "Arch"
                          ]
                      }
                  ]
              },
              "KeyName": {
                  "Ref": "KeyName"
              },
              "NetworkInterfaces": [
                  {
                      "GroupSet": [
                          {
                              "Ref": "WebServerSecurityGroup"
                          }
                      ],
                      "AssociatePublicIpAddress": "true",
                      "DeviceIndex": "0",
                      "DeleteOnTermination": "true",
                      "SubnetId": {
                          "Ref": "PublicSubnet"
                      }
                  }
              ],
              "UserData": {
                  "Fn::Base64": {
                      "Fn::Join": [
                          "",
                          [
                              "#!/bin/bash -xe\n",
                              "yum install -y aws-cfn-bootstrap\n",
                              "# Install the files and packages from the metadata\n",
                              "/opt/aws/bin/cfn-init -v ",
                              "         --stack ",
                              {
                                  "Ref": "AWS::StackName"
                              },
                              "         --resource WebServerInstance ",
                              "         --configsets All ",
                              "         --region ",
                              {
                                  "Ref": "AWS::Region"
                              },
                              "\n",
                              "# Signal the status from cfn-init\n",
                              "/opt/aws/bin/cfn-signal -e $? ",
                              "         --stack ",
                              {
                                  "Ref": "AWS::StackName"
                              },
                              "         --resource WebServerInstance ",
                              "         --region ",
                              {
                                  "Ref": "AWS::Region"
                              },
                              "\n"
                          ]
                      ]
                  }
              }
          },
          "Metadata": {
              "AWS::CloudFormation::Designer": {
                  "id": "d9fa423e-40ed-46af-9c9e-68a443299850"
              },
              "AWS::CloudFormation::Init": {
                  "configSets": {
                      "All": [
                          "ConfigureSampleApp"
                      ]
                  },
                  "ConfigureSampleApp": {
                      "packages": {
                          "yum": {
                              "httpd": []
                          }
                      },
                      "files": {
                          "/var/www/html/index.html": {
                              "content": {
                                  "Fn::Join": [
                                      "\n",
                                      [
                                          "<h1>Congratulations, you have successfully launched the AWS CloudFormation sample.</h1>"
                                      ]
                                  ]
                              },
                              "mode": "000644",
                              "owner": "root",
                              "group": "root"
                          }
                      },
                      "services": {
                          "sysvinit": {
                              "httpd": {
                                  "enabled": "true",
                                  "ensureRunning": "true"
                              }
                          }
                      }
                  }
              }
          }
      }
      ....
}
```

_CloudFormation_ YAML template:

```
AWSTemplateFormatVersion: 2010-09-09
Resources:
  VPC:
    Type: 'AWS::EC2::VPC'
    Properties:
      EnableDnsSupport: 'true'
      EnableDnsHostnames: 'true'
      CidrBlock: 10.0.0.0/16
    Metadata:
      'AWS::CloudFormation::Designer':
        id: 41b7e114-3c91-478b-bfe8-1c40e7060e2d
  PublicSubnet:
    Type: 'AWS::EC2::Subnet'
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.0.0/24
    Metadata:
      'AWS::CloudFormation::Designer':
        id: 7a39805a-1d34-45fc-9aa3-8d5acc9dfd5a
  WebServerInstance:
    Type: 'AWS::EC2::Instance'
    Properties:
      InstanceType: !Ref InstanceType
      ImageId: !FindInMap
        - AWSRegionArch2AMI
        - !Ref 'AWS::Region'
        - !FindInMap
          - AWSInstanceType2Arch
          - !Ref InstanceType
          - Arch
      KeyName: !Ref KeyName
      NetworkInterfaces:
        - GroupSet:
            - !Ref WebServerSecurityGroup
          AssociatePublicIpAddress: 'true'
          DeviceIndex: '0'
          DeleteOnTermination: 'true'
          SubnetId: !Ref PublicSubnet
      UserData: !Base64
        'Fn::Join':
          - ''
          - - |
              #!/bin/bash -xe
            - |
              yum install -y aws-cfn-bootstrap
            - |
              # Install the files and packages from the metadata
            - '/opt/aws/bin/cfn-init -v '
            - '         --stack '
            - !Ref 'AWS::StackName'
            - '         --resource WebServerInstance '
            - '         --configsets All '
            - '         --region '
            - !Ref 'AWS::Region'
            - |+

            - |
              # Signal the status from cfn-init
            - '/opt/aws/bin/cfn-signal -e $? '
            - '         --stack '
            - !Ref 'AWS::StackName'
            - '         --resource WebServerInstance '
            - '         --region '
            - !Ref 'AWS::Region'
            - |+

    Metadata:
      'AWS::CloudFormation::Designer':
        id: d9fa423e-40ed-46af-9c9e-68a443299850
      'AWS::CloudFormation::Init':
        configSets:
          All:
            - ConfigureSampleApp
        ConfigureSampleApp:
          packages:
            yum:
              httpd: []
          files:
            /var/www/html/index.html:
              content: !Join
                - |+

                - - >-
                    <h1>Congratulations, you have successfully launched the AWS
                    CloudFormation sample.</h1>
              mode: '000644'
              owner: root
              group: root
          services:
            sysvinit:
              httpd:
                enabled: 'true'
                ensureRunning: 'true'
      ....
```


* **Stacks**
* In _CloudFormation_ when you group related resources such as an Auto Scaling Group, Elastic Load Balancer and an EC2 instance within a template, this refers to a _stack_. This allows for managing these resources in a single unit, to create a stack you can submit it via the [console](https://console.aws.amazon.com/cloudformation/) or using the AWS CLI using the following command:

```
> aws cloudformation create-stack --stack-name myappstack --template-body file://{PATH_TO_FILE}.json --parameters [K=V]
```
* **Change sets**

If you want to make modifications to resources in you _stack_, you should create a _change set_ which allows you to see how the changes you are making will impact your running resources. _Change sets_ can be referred to as _AWS CloudFormation_ equivalent of _terraform plan_, which provides a view of changes so you can plan the changes accordingly.

Example:

You want to rename the instance of a database in Amazon RDS, _CloudFormation_ will create a new database and delete the old one. If you haven't done a backup you will lose all your data, using a _change set_ will allow you view the fact that your database will be erased and you can take the measures accordingly before applying the changes.

The following diagram, taken from the [AWS Documentation on change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html), summarizes how the use of change sets to up a stack works.

![change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/images/update-stack-changesets-diagram.png)


## Provisioning Infrastructure with AWS CloudFormation

Once your template is written there are two ways to get the infrastructure provisioned in your AWS environment. One is to use the AWS CLI and the other is using the Console.

### AWS CloudFormation CLI

The CloudFormation commands come installed with the AWS CLI, to install the CLI please see the [installation instructions](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html). The full list of commands can be found in the official [documentation](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/index.html), but for the purpose of this blog we will only focus on _deploy_ and _delete-stack_ commands.

**deploy**

The follow command example will provision a Stack in CloudFormation called DemoStack and will override parameters in the template using the `--parameter-overrides` flag and using the `--tags` flag you can add metadata attributes to the resources created by the template.

```
aws cloudformation deploy --template-file </path_to_template/template.json> --stack-name DemoStack --parameter-overrides Key1=Value1 Key2=Value2 --tags Key1=Value1 Key2=Value2
```

Using our template from early this is what the command would look like:

```
aws cloudformation deploy --template-file DemoWebServer.json --stack-name DemoWebServerStack --parameter-overrides KeyName=ec2-key-pair --tags ENV=demo
```

When the command executes and completes the output should be as follows:

```
Waiting for changeset to be created..
Waiting for stack create/update to complete
Successfully created/updated stack - DemoWebServerStack
```

You can also see the Stack created in the AWS Console :

![AWS CF Stack](/images/AWS-CF-CLI-Console.png)


To delete the stack that was created you can run the following command: `aws cloudformation delete-stack --stack-name DemoWebServerStack`.

### AWS CloudFormation Designer

The second option for creating stacks is using the _Designer_ which is a UI workflow (Drag & Drop) that allows for the creation of CloudFromation Templates.

![AWS CF Designer Stack](/images/AWS-CF-Designer.png)

The _Designer_ allows you to export the CloudFormation template in JSON or YAML format and when you are ready to deploy the template your are asked to store the template in an S3 bucket. By storing the template in an S3 bucket you can make modifications to the Stack without having to recreate the template, S3 also allows for versioning of the file.


## AWS CloudFormation Registry

The CloudFormation Registry is a storage service offer that allows you or your organization to manage CloudFormation extensions (public and private) such as resources, modules, and hooks.

Extension types are registered as either public or private. Currently, the registry offers the following extension types:

* Resource types – model and provision custom logic as a resource, using stacks in CloudFormation.
* Modules – package resource configurations for inclusion across stack templates, in a transparent, manageable, and repeatable way.
* Hooks – proactively inspect the configuration of your AWS resources before provisioning.

Public extensions are those that are published to the registry by AWS or third-party AWS Marketplace publishers, to learn more about public extensions please see the [aws documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-public.html).

Private extensions are those that registered and active for use in your your AWS Account.

There are two kinds of private extensions:

* Activated private extensions – Are the local copies of third-party extensions that you have activated for your account and region. When you activate a third-party public extension, CloudFormation creates a local copy of that extension in your account's registry.

* Registered private extensions – Can also activate private extensions that aren't listed in the public CloudFormation registry. These may be extensions you've created yourself, or ones shared with you by your organization or other third party. To use such a private extension in your account, you must first register it. Registering the extension uploads a copy of it to the CloudFormation registry in your account and activates it.

For details on how to use private extensions please see the [AWS documentation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/registry-private.html)


## AWS CDK

The AWS Cloud Development Kit (AWS CDK) is an open-source software development framework used to define your cloud application resources using the programming languages you are most comfortable with and provisions the resources through AWS CloudFormation.

AWS CDK currently supports the following programming languages: TypeScript, Python, Java, .NET, and Go (in Developer Preview).

The following sample shows what a AWS CDK Stack looks written in TypeScript.
The sample can be found on my github repo [here](https://github.com/DavidDTessier/iac-tools-samples/tree/main/AWS_Native/AWS_CDK).

```
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { readFileSync } from 'fs';

export class AwsCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const vpc = ec2.Vpc.fromLookup(this, id = 'VPC',  {isDefault: true})

    const webserverSG = new ec2.SecurityGroup(this, 'webserver-sg', {
      vpc : vpc,
      allowAllOutbound: true
    })

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere'
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'allow HTTP traffic from anywhere.'
    );

    webserverSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'allow HTTPS traffic from anywhere.'
    );


    // create a role for the EC2 instanceType
    const webserverRole = new iam.Role(this,'webserver-role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess'),
      ]
    });


    const ec2Instance = new ec2.Instance(this,'ec2Instance', {
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage({
          generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
        }),
        keyName: 'ec2-key-pair',
        vpc: vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC
        },
        role: webserverRole,
        securityGroup: webserverSG
    });

    // load contents of script
    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8');

    // add the User Data script to the Instance
    ec2Instance.addUserData(userDataScript);
  }

}

```

As you can see the code is simple and readable for any developer to understand. Using the AWS CDK provides the ability to embedded custom code built in you language of choice to extend the functionality provided by the underlying framework.

There are a few command that make AWS CDK function _cdk init_, _cdk synth_, _cdk diff_, and _cdk deploy_ which I will go into detail below.

**cdk init**
This command initializes a new project directory with a default structure ready for you to get started coding.

```
%cdk init
* app: Template for a CDK Application
   └─ cdk init app --language=[csharp|fsharp|go|java|javascript|python|typescript]
* lib: Template for a CDK Construct Library
   └─ cdk init lib --language=typescript
* sample-app: Example CDK Application with some constructs
   └─ cdk init sample-app --language=[csharp|fsharp|go|java|javascript|python|typescript]
```

As you can see  there are several options _app_ is just a bare bones template in the language of your choosing, _lib_ will create a base construct library which you can then import into a separate project from more details see [AWS CDK Construct Library Document](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html), and finally _sample-app_ will provide a base Application with sample constructs/resources.

```
% mkdir temp
% cd temp
% cdk init sample-app -l typescript
```

The above command creates a sample application called _TempStack_ inside the `temp` directory.

The following folder structure is what gets generated.

![CDK Sample App](/images/AWS-CDK-Folders.png)

The _lib_ directory contains a `tempstack.js` file which has all the code necessary for building infrastructure.

**Boostrapping**

In order for you to deploy AWS CDK apps into an AWS [environment](https://docs.aws.amazon.com/cdk/v2/guide/environments.html) some prerequisite resources and services configured in order to perform the deployment. The process of provisioning these initial resources is referred to as _bootstrapping_.

To bootstrap your environment you run the following command which can bootstrap one or more environments:

`cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1 aws://ACCOUNT-NUMBER-2/REGION-2 ...`

Once you environment is bootstrap you should see a stack called _CDKToolkit_ in the CloudFormation console.

The stack contains all the necessary resources required to allow you to run CDK deployments.

**cdk synth**

Running `cdk synth` with generate the _CloudFormation_ template defined in your app code.

**cdk deploy**
After _bootstrapping_ your environment, your project is initialized, and you have one or more resources to provision you can then run the the _deploy_ command to create the infrastructure.

```
cdk deploy        # if app contains only one stack
cdk deploy MyStack
cdk deploy Stack1 Stack2
cdk deploy "*"    # all stacks in app
```

The `deploy` command will automatically run the `synth` command to generate _CloudFormation_ templates to reflect any changes done since a previous synthesize. If you want to skip this duplicate synth your can specify your project's _cdk.out_ directory using the `--app` option flag.

`cdk deploy --app cdk.out MyStack`

For those familiar with _Terraform_ or _Terraform CDK_ this command is the same as `cdktf deploy`.

**cdk diff**

To check for differences between the current verison of a stack defined by your app and a previously deployed version, or saved a AWS CloudFormation template run the `cdk diff {stackname}` command. This will print out the list of changes for you to review before running the `cdk deploy` command.

For those familiar with _Terraform_ or _Terraform CDK_ this command is the same as `cdktf plan` which runs `terraform plan` command.


# AWS Native Tooling vs Terraform

Final thoughts on whether to use AWS native tooling or terraform, it all comes down to what your organization is doing in respect of their cloud journey. If they are using AWS as their only cloud environment then I would lean more towards AWS CF or CDK due to the tight integration with the wider AWS ecosystem. If your infrastructure team has already adopted Terraform then it makes sense to stay with that tool set. Also if your organization is planning to use more than one cloud then the adoption of Terraform is a much better option so all your IaC is written in a single language and framework.



Stay tuned for the final entry in this series where I will look at GCP Cloud Deployment Manager and another multi-cloud tool called Plumi, I will also give my overall tooling recommendations.
