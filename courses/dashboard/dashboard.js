// Dashboard JavaScript for AI Course Platform\n\n// Mock API endpoints for demonstration\nconst API_BASE = 'http://localhost:8000';

// Show different sections
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.course-form, .course-list').forEach(el => {
        el.style.display = 'none';
    });

    // Show the requested section
    document.getElementByRole(section + '-section').style.display = 'block';

    // Load section-specific content
    if (section === 'list') {
        loadCourses();
    } else if (section === 'analytics') {
        loadAnalytics();
    }
}

// Load courses from API
async function loadCourses() {
    const courseList = document.getElementById('course-list-content');
    courseList.innerHTML = '<div class="loading">Loading courses...</div>';

    try {
        // Mock data for demonstration
        const mockCourses = [
            {
                id: 'course_1',
                title: 'Introduction to Machine Learning',
                description: 'Learn the fundamentals of ML algorithms and concepts',
                topic: 'Machine Learning',
                level: 'beginner',
                duration: 6,
                status: 'active',
                enrollment_count: 45,
                completion_rate: 78
            },
            {
                id: 'course_2',
                title: 'Advanced Data Science',
                description: 'Deep dive into data science techniques and tools',
                topic: 'Data Science',
                level: 'advanced',
                duration: 8,
                status: 'active',
                enrollment_count: 23,
                completion_rate: 65
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
                completion_rate: 42
            }
        ];

        courseList.innerHTML = '';
        mockCourses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.className = 'course-card';
            courseCard.innerHTML = `
                <h3>📖 ${course.title}</h3>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span>🎯 ${course.topic}</span>
                    <span>📊 ${course.level}</span>
                    <span>⏱️ ${course.duration} weeks</span>
                    <span>📝 ${course.enrollment_count} students</span>
                    <span class="status ${course.status}">${course.status.toUpperCase()}</span>
                </div>
            `;
            courseList.appendChild(courseCard);
        });
    } catch (error) {
        courseList.innerHTML = `<div class="error">Failed to load courses: ${error.message}</div>`;
    }
}

// Load analytics
async function loadAnalytics() {
    const analyticsContent = document.getElementById('analytics-content');
    analyticsContent.innerHTML = '<div class="loading">Loading analytics...</div>';

    try {
        // Mock analytics data
        analyticsContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); padding: 20px; border-radius: 10px; color: white;">
                    <h3 style="margin-bottom: 10px;">Total Courses</h3>
                    <p style="font-size: 2rem; font-weight: bold;">3</p>
                </div>
                <div style="background: linear-gradient(135deg, #ff9a76 0%, #f095f1 100%); padding: 20px; border-radius: 10px; color: white;">
                    <h3 style="margin-bottom: 10px;">Active Students</h3>
                    <p style="font-size: 2rem; font-weight: bold;">80</p>
                </div>
                <div style="background: linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%); padding: 20px; border-radius: 10px; color: white;">
                    <h3 style="margin-bottom: 10px;">Completion Rate</h3>
                    <p style="font-size: 2rem; font-weight: bold;">61%</p>
                </div>
            </div>
        `;
    } catch (error) {
        analyticsContent.innerHTML = `<div class="error">Failed to load analytics: ${error.message}</div>`;
    }
}

// Create course form submission
async function initializeDashboard() {
    // Create course form
    const createForm = document.getElementById('create-course-form');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                // Simulate API call
                const response = await new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            id: 'course_' + Date.now(),
                            ...formData,
                            status: 'active',
                            enrollment_count: 0,
                            completion_rate: 0
                        });
                    }, 1000);
                });

                alert(`Course created successfully! Course ID: ${response.id}`);
                document.getElementById('create-course-form').reset();
                showSection('list');
            } catch (error) {
                alert(`Error creating course: ${error.message}`);
            }
        });
    }

    // Initialize navigation
    document.querySelectorAll('nav button').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.textContent.split(' ')[1] || button.textContent;
            showSection(section.toLowerCase());
        });
    });

    // Initialize with list section
    showSection('list');
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Make functions available globally
window.showSection = showSection;