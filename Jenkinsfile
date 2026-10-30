pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = "yashraj0409/meditrack"
        IMAGE_TAG = "${BUILD_NUMBER}"
        NAMESPACE = "healthcare"
        JENKINS_HOME_DIR = "/var/jenkins_home"
    }
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out MediTrack source code..."
                checkout scm
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }
        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} -t ${DOCKER_IMAGE}:latest ."
            }
        }
        stage('Docker Push') {
            steps {
                sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${DOCKER_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_IMAGE}:latest"
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh "kubectl apply -f k8s/namespace.yaml"
                sh "sed 's|DOCKER_USER/meditrack:IMAGE_TAG|${DOCKER_IMAGE}:${IMAGE_TAG}|g' k8s/deployment.yaml | kubectl apply -f -"
                sh "kubectl rollout status deployment/meditrack-deployment -n ${NAMESPACE} --timeout=120s"
            }
        }
        stage('Verify') {
            steps {
                sh "kubectl get pods -n ${NAMESPACE}"
                sh "kubectl get services -n ${NAMESPACE}"
            }
        }
    }
    post {
        success {
            echo "MediTrack Build #${BUILD_NUMBER} deployed successfully!"
        }
        failure {
            sh "kubectl rollout undo deployment/meditrack-deployment -n ${NAMESPACE} || true"
            echo "Deployment failed — rolled back!"
        }
    }
}
