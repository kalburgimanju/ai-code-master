"use strict';

// Dashboard Application for AI Course Platform
// Integrates frontend with backend API

class DashboardApp {
    constructor() {
        this.apiBase = 'http://localhost:8000';
        this.currentSection = 'dashboard';
        this.courses = [];
        this.currentCourse = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupCourseForm();
        this.setupModal();
        this.loadDashboard();
        this.setupRealTimeUpdates();
        this.setupSearch();
        this.setupCourseDetail();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('nav button');

        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.textContent.split(' ')[1] ||
                               e.target.textContent.split('\n')[0];
                this.showSection(section.toLowerCase());
            });
        });
    }

    setupCourseForm() {
        const form = document.getElementById('create-course-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.createCourse();
        });
    }

    setupModal() {
        const modal = document.getElementById('course-modal');
        const closeBtn = document.getElementById('close-modal');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async loadDashboard() {
        const courseList = document.getElementById('course-list-content');
        courseList.innerHTML = '<div class="loading">Loading courses...</div>';

        try {
            // Mock courses for demonstration
            this.courses = [
                {
                    id: 'course_1',
                    title: 'Introduction to Machine Learning',
                    description: 'Learn the fundamentals of ML algorithms and concepts',
                    topic: 'Machine Learning',
                    level: 'beginner',
                    duration: 6,
                    status: 'active',
                    enrollment_count: 45,
                    completion_rate: 78,
                    logo: '/uploads/logos/ml-logo.png'
                },
                {
                    id: 'course_2',
                    title: 'Advanced Data Science',
                    description: 'Deep dive into data science techniques and tools',
                    topic: 'Data Science',
                    level sharpening: 'advanced',
                    duration: 8,
                    status: 'active',
                    enrollment_count: 23,
                    completion_rate: 65,
                    logo: '/uploads/logos/ds-logo.png'
                },
                {
                    id: 'course_3',
                    title: 'AI Ethics and Responsible Computing',
                    description: 'Explore ethical considerations in AI development',
                    topic: 'AI Ethics',
                    level: 'intermediate',
                    duration: 4,
                    status: 'inactive',
                    enrollment_count: 12,
                    completion_rate: 42,
                    logo: '/uploads/logos/ethics-logo.png'
                }
            ];

            this.renderCourses();
        } catch (error) {
            courseList.innerHTML = `<div class="error">Failed to load courses: ${error.message}</div>`;
        }
    }

    renderCourses() {
        const courseList = document.getElementById('course-list-content');
        courseList.innerHTML = '';

        this.courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <div class="course-card-header">
                    <h3>📖 ${course.title}</h3>
                    <span class="status ${course.status}">${course.status.toUpperCase()}</span>
                </div>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span>🎯 ${course.topic}</span>
                    <span>📊 ${course.level}</span>
                    <span>⏱️ ${course.duration} weeks</span>
                    <span>📝 ${course.enrollment_count} students</span>
                    <span>✅ ${course.completion_rate}% complete</span>
                </div>
                <div class="course-actions">
                    <button class="btn-primary" onclick="dashboard.openCourseDetails('${course.id}')">View Details</button>
                    <button class="btn-secondary" onclick="dashboard.createPresentation('${course.id}')">Create Presentation</button>
                    ${course.status === 'active' ? `<button class="btn-danger" onclick="dashboard.deleteCourse('${course.id}')">Delete</button>` : ''}
                </div>
            `;
            courseList.appendChild(courseCard);
        });
    }

    async createCourse() {
        const formData = {
            title: document.getElementById('course-title').value,
            topic: document.getElementById('course-topic').value,
            description: document.getElementById('course-description').value,
            level: document.getElementById('course-level').value,
            duration: parseInt(document.getElementById('course-duration').value)
        };

        // Validate form
        if (!formData.title || !formData.topic || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            // Mock API call
            const newCourse = {
                id: 'course_' + Date.now(),
                ...formData,
                status: 'active',
                enrollment_count: 0,
                completion_rate: 0,
                logo: '/uploads/logos/default-logo.png'
            };

            this.courses.unshift(newCourse);
            this.renderCourses();
            alert(`Course created successfully! Course ID: ${newCourse.id}`);
            document.getElementById('create-course-form').reset();
            showSection('list');
        } catch (error) {
            alert(`Error creating course: ${error.message}`);
        }
    }

    openCourseDetails(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        this.currentCourse = course;
        this.showCourseDetails(course);
    }

    showCourseDetails(course) {
        const modal = document.getElementById('course-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');

        modalTitle.textContent = course.title;
        modalContent.innerHTML = `
            <div class="course-detail">
                <div class="detail-section">
                    <h4>Course Information</h4>
                    <p><strong>Topic:</strong> ${course.topic}</p>
                    <p><strong>Level:</strong> ${course.level}</p>
                    <p><strong>Duration:</strong> ${course.duration} weeks</p>
                    <p><strong>Status:</strong> <span class="status ${course.status}">${course.status}</span></p>
                    <p><strong>Students Enrolled:</strong> ${course.enrollment_count}</p>
                    <p><strong>Completion Rate:</strong> ${course.completion_rate}%</p>
                </div>

                <div class="detail-section">
                    <h4>Actions</h4>
                    <button class="btn-primary" onclick="dashboard.createPresentation('${course.id}')">Create Presentation</button>
                    <button class="btn-secondary" onclick="dashboard.trackProgress('${course.id}')">Track Progress</button>
                    <button class="btn-danger" onclick="dashboard.issueCertificate('${course.id}')">Issue Certificate</button>
                </div>

                <div class="detail-section">
                    <h4>Social Media Integration</h4>
                    <button class="btn-social" onclick="dashboard.shareToSocialMedia('${course.id}', 'youtube')">📺 YouTube</button>
                    <button class="btn-social" onclick="dashboard.shareToSocialMedia('${course.id}', 'facebook')">📘 Facebook</button>
                    <button class="btn-social" onclick="dashboard.shareToSocialMedia('${course.id}', 'twitter')">🐦 Twitter</button>
                    <button class="btn-social" onclick="dashboard.shareToSocialMedia('${course.id}', 'linkedin')">🔗 LinkedIn</button>
                  </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    async createPresentation(courseId) {
        try {
            // Mock API call
            const presentation = {
                id: `pres_${courseId}`,
                course_id: courseId,
                title: `Presentation: ${this.currentCourse.title}`,
                status: 'completed',
                url: `/presentations/pres_${courseId}.pptx`
            };

            alert(`Presentation created successfully! Presentation ID: ${presentation.id}`);
            this.showNotification('Presentation created for ' + this.currentCourse.title);
        } catch (error) {
            alert(`Error creating presentation: ${error.message}`);
        }
    }

    shareToSocialMedia(courseId, platform) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const socialMessages = {
            youtube: `New video: "${course.title}" - Learn ${course.topic} with AI Course Platform!`,
            facebook: `Exciting new course: "${course.title}" - ${course.description}`,
            twitter: `New AI course: "${course.title}" - Level: ${course.level}. #AI #MachineLearning`,
            linkedin: `New professional course: "${course.title}" - ${course.topic}. Join the learning community!`
        };

        alert(`${platform.toUpperCase()} Post:\n${socialMessages[platform]}`);
        this.showNotification(`Shared ${course.title} to ${platform.toUpperCase()}`);
    }

    trackProgress(courseId) {
        // Redirect to progress tracking page or show modal
        alert('Progress tracking feature would open here with detailed analytics');
    }

    issueCertificate(courseId) {
        // Generate certificate
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const certificate = {
            id: `cert_${courseId}_${Date.now()}`,\n            course_id: courseId,\n            student_id: 'demo_student',
            course_name: course.title,
            completion_score: Math.floor(Math.random() * 40) + 60,\n            issued_at: new Date().toISOString(),\n            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()\n        };

        alert(`Certificate issued! Certificate ID: ${certificate.id}\nCourse: ${course.title}\nScore: ${certificate.completion_score}%`);
        this.showNotification('Certificate issued for ' + course.title);
    }

    deleteCourse(courseId) {
        if (confirm('Are you sure you want to delete this course?')) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            this.renderCourses();
            this.showNotification('Course deleted successfully');
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-courses');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCourses = this.courses.filter(course =>
                course.title.toLowerCase().includes(searchTerm) ||
                course.topic.toLowerCase().includes(searchTerm)
            );
            this.renderCourses(filteredCourses);
        });
    }

    showNotification(message) {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;

        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = message;
        notifications.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setupRealTimeUpdates() {
        // Simulate real-time updates
        setInterval(() => {
            this.simulateUpdates();
        }, 30000);
    }

    simulateUpdates() {
        // Simulate random updates for demo purposes
        const randomCourse = this.courses[Math.floor(Math.random() * this.courses.length)];
        if (randomCourse) {
            randomCourse.enrollment_count += Math.floor(Math.random() * 3);
            randomCourse.completion_rate = Math.min(randomCourse.completion_rate + Math.floor(Math.random() * 5), 100);
            this.renderCourses();
        }
    }
}

// Global function to show sections
def showSection(section) {
    // Hide all sections
    document.querySelectorAll('.course-form, .course-list, .analytics-section').forEach(el => {
        el.style.display = 'none';
    });

    // Show the requested section
    const targetSection = document.getElementById(section + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';

        // Load section-specific content
        if (section === 'list') {
            dashboard.loadCourses();
        } else if (section === 'analytics') {
            dashboard.loadAnalytics();
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardApp();
});