pipeline {
    agent any

    environment {
        SCANNER_HOME = tool 'SonarScanner'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm run test:cov'
            }
        }

        stage('SonarCloud Analysis + Quality Gate') {
            steps {
                withSonarQubeEnv('SonarCloud-Backend') {
                    sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                          -Dsonar.qualitygate.wait=true \
                          -Dsonar.qualitygate.timeout=300
                    """
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t whatsduetomorrow-backend:latest -f dockerfile .'
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'jwt-secret',   variable: 'JWT_SECRET'),
                    string(credentialsId: 'db-host',      variable: 'DB_HOST'),
                    string(credentialsId: 'db-port',      variable: 'DB_PORT'),
                    string(credentialsId: 'db-username',  variable: 'DB_USERNAME'),
                    string(credentialsId: 'db-password',  variable: 'DB_PASSWORD'),
                    string(credentialsId: 'db-database',  variable: 'DB_DATABASE'),
                    string(credentialsId: 'EMAIL_FROM', variable: 'EMAIL_FROM'),
                    string(credentialsId: 'GMAIL_APP_PASSWORD', variable: 'GMAIL_APP_PASSWORD'),
                    string(credentialsId: 'GMAIL_USER', variable: 'GMAIL_USER'),
                    string(credentialsId: 'RESEND_API_KEY', variable: 'RESEND_API_KEY')
                ]) {
                    sh '''
                        docker rm -f whatsduetomorrow-backend || true
                        docker run -d \
                          --name whatsduetomorrow-backend \
                          --network devops-net \
                          -p 3000:3000 \
                          -e DB_HOST="$DB_HOST" \
                          -e DB_PORT="$DB_PORT" \
                          -e DB_USERNAME="$DB_USERNAME" \
                          -e DB_PASSWORD="$DB_PASSWORD" \
                          -e DB_DATABASE="$DB_DATABASE" \
                          -e JWT_SECRET="$JWT_SECRET" \
                          -e EMAIL_FROM="$EMAIL_FROM" \
                          -e GMAIL_APP_PASSWORD="$GMAIL_APP_PASSWORD" \
                          -e GMAIL_USER="$GMAIL_USER" \
                          -e RESEND_API_KEY="$RESEND_API_KEY" \
                          -e PORT=3000 \
                          whatsduetomorrow-backend:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline backend finalizado: ${currentBuild.currentResult}"
        }
    }
}
