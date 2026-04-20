pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'mi-sitio-jenkins-me-walterfontoura82'
        WEBSITE_URL = "http://${S3_BUCKET}.s3-website-${AWS_DEFAULT_REGION}.amazonaws.com"
    }

    stages {
        stage('Instalar dependencias') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo 'Instalando dependencias'
                sh 'npm ci'
                echo 'Dependencias instaladas'
            }
        }

        stage('Ejecutar pruebas') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                echo 'Ejecutando pruebas...'
                sh 'npm test'
                echo 'Pruebas finalizadas'
            }
        }

        stage('Crear bucket S3') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -e

                        if ! aws s3api head-bucket --bucket "$S3_BUCKET" 2>/dev/null; then
                            if [ "$AWS_DEFAULT_REGION" = "us-east-1" ]; then
                                aws s3api create-bucket \
                                    --bucket "$S3_BUCKET" \
                                    --region "$AWS_DEFAULT_REGION"
                            else
                                aws s3api create-bucket \
                                    --bucket "$S3_BUCKET" \
                                    --region "$AWS_DEFAULT_REGION" \
                                    --create-bucket-configuration LocationConstraint="$AWS_DEFAULT_REGION"
                            fi
                        fi
                    '''
                }
            }
        }

        stage('Configurar sitio web S3') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -e

                        aws s3api put-public-access-block \
                            --bucket "$S3_BUCKET" \
                            --public-access-block-configuration \
                            BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

                        aws s3 website "s3://$S3_BUCKET" \
                            --index-document index.html \
                            --error-document index.html

                        cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$S3_BUCKET/*"
    }
  ]
}
EOF

                        aws s3api put-bucket-policy \
                            --bucket "$S3_BUCKET" \
                            --policy file://bucket-policy.json
                    '''
                }
            }
        }

        stage('Desplegar archivos estaticos') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-credentials',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    )
                ]) {
                    sh '''
                        set -e

                        aws s3 sync . "s3://$S3_BUCKET" \
                            --exclude ".git/*" \
                            --exclude "node_modules/*" \
                            --exclude "tests/*" \
                            --exclude "package*.json" \
                            --exclude "Jenkinsfile" \
                            --exclude "bucket-policy.json" \
                            --delete
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline ejecutado con exito"
            echo "Sitio disponible en: ${WEBSITE_URL}"
        }
        failure {
            echo 'Pipeline fallido'
        }
    }
}
