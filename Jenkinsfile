pipeline {
  agent any

  environment {
    IMAGE_NAME = 'websitetry3'
  }

  stages {
    stage('Build Docker image') {
      steps {
        script {
          def imageTag = "${env.BUILD_NUMBER ?: 'local'}"
          sh "docker build -t ${IMAGE_NAME}:${imageTag} ."
        }
      }
    }

    stage('Verify app container') {
      steps {
        script {
          def imageTag = "${env.BUILD_NUMBER ?: 'local'}"
          sh "docker run --rm -d --name ${IMAGE_NAME}-test -p 8080:80 ${IMAGE_NAME}:${imageTag}"
          sh 'sleep 5'
          sh 'curl -I http://127.0.0.1:8080'
          sh "docker rm -f ${IMAGE_NAME}-test"
        }
      }
    }
  }
}
