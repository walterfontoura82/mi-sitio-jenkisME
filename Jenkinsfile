pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'us-east-1'
        S3_BUCKET = 'lab-clase17-mi-app'
        ARTIFACT_NAME = "mi-app-${BUILD_NUMBER}.tar.gz"
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
                sh 'npm ci || npm install'
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

        stage('Empaquetar aplicacion') {
            steps {
                sh 'tar --exclude=node_modules --exclude=.git --exclude="$ARTIFACT_NAME" -czf "$ARTIFACT_NAME" .'
                archiveArtifacts artifacts: env.ARTIFACT_NAME, fingerprint: true
            }
        }

        stage('Crear bucket y subir a S3') {
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

                        aws s3 cp "$ARTIFACT_NAME" "s3://$S3_BUCKET/builds/$ARTIFACT_NAME"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline ejecutado con exito'
        }
        failure {
            echo 'Pipeline fallido'
        }
    }
}