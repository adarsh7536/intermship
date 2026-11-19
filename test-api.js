const { server } = require('./server');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  let failures = 0;

  async function assert(desc, condition, details = '') {
    if (condition) {
      console.log(`  ✓ PASS: ${desc}`);
    } else {
      console.error(`  ✕ FAIL: ${desc} ${details}`);
      failures++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    await assert('Health Check endpoint returns online status', healthData.status === 'online');

    // 2. User Registration
    const testUser = {
      name: 'John Developer',
      username: 'johndev_' + Date.now(),
      email: `john_${Date.now()}@example.com`,
      password: 'password123'
    };

    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const regData = await regRes.json();
    await assert('User Registration returns 201 and token', regRes.status === 201 && regData.token && regData.user.name === testUser.name);

    // 2b. User Registration with existing email (duplicate check)
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    await assert('User Registration rejects duplicate email with 409', dupRes.status === 409);

    // 3. User Login (valid credentials)
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginRes.json();
    await assert('User Login returns 200 with session token', loginRes.status === 200 && !!loginData.token);
    const authToken = loginData.token;

    // 3b. User Login with demo credentials
    const demoLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex@example.com',
        password: 'password123'
      })
    });
    const demoLoginData = await demoLoginRes.json();
    await assert('Demo User Login (alex@example.com) succeeds', demoLoginRes.status === 200 && demoLoginData.user.name === 'Alex Morgan');

    // 3c. User Login with invalid password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: 'wrongpassword'
      })
    });
    await assert('User Login with wrong password returns 401', badLoginRes.status === 401);

    // 4. Create Blog
    const newBlogPayload = {
      title: 'Full Stack Node & Express Architecture',
      category: 'Web Dev',
      excerpt: 'A comprehensive walkthrough of setting up modular REST APIs with Node.js and Express.',
      content: '## REST API Design\nIn this article we cover how to build structured REST APIs...',
      tags: ['Node.js', 'Express', 'Backend'],
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
    };

    const createBlogRes = await fetch(`${BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(newBlogPayload)
    });
    const createBlogData = await createBlogRes.json();
    await assert('Create Blog returns 201 with saved post', createBlogRes.status === 201 && createBlogData.blog && createBlogData.blog.id);
    const createdPostId = createBlogData.blog ? createBlogData.blog.id : null;

    // 5. Get All Blogs
    const getBlogsRes = await fetch(`${BASE_URL}/blogs`);
    const getBlogsData = await getBlogsRes.json();
    await assert('Get Blogs returns 200 with list of posts', getBlogsRes.status === 200 && Array.isArray(getBlogsData.blogs) && getBlogsData.blogs.length > 0);

    // 5b. Search Blogs
    const searchRes = await fetch(`${BASE_URL}/blogs?search=Full+Stack`);
    const searchData = await searchRes.json();
    await assert('Search Blogs returns matching posts', searchRes.status === 200 && searchData.blogs.some(b => b.id === createdPostId));

    // 6. Get Single Blog By ID
    if (createdPostId) {
      const getSingleRes = await fetch(`${BASE_URL}/blogs/${createdPostId}`);
      const getSingleData = await getSingleRes.json();
      await assert('Get Single Blog by ID returns post details', getSingleRes.status === 200 && getSingleData.blog.title === newBlogPayload.title);

      // 7. Update Blog
      const updateRes = await fetch(`${BASE_URL}/blogs/${createdPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Full Stack Node & Express Architecture (Updated)' })
      });
      const updateData = await updateRes.json();
      await assert('Update Blog returns updated title', updateRes.status === 200 && updateData.blog.title.includes('(Updated)'));

      // 8. Like Blog
      const likeRes = await fetch(`${BASE_URL}/blogs/${createdPostId}/like`, { method: 'POST' });
      const likeData = await likeRes.json();
      await assert('Like Blog increments likes counter', likeRes.status === 200 && likeData.likes === 1);

      // 9. Add Comment to Blog
      const commentRes = await fetch(`${BASE_URL}/blogs/${createdPostId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'Code Reviewer', text: 'Excellent guide on Express APIs!' })
      });
      const commentData = await commentRes.json();
      await assert('Add Comment appends comment to blog', commentRes.status === 201 && commentData.comments.length === 1);

      // 10. Delete Blog
      const deleteRes = await fetch(`${BASE_URL}/blogs/${createdPostId}`, { method: 'DELETE' });
      await assert('Delete Blog returns 200 success', deleteRes.status === 200);

      // 10b. Verify deleted blog returns 404
      const verifyDelRes = await fetch(`${BASE_URL}/blogs/${createdPostId}`);
      await assert('Fetching deleted blog returns 404', verifyDelRes.status === 404);
    }

    // 11. Convenience endpoints test (/api/register, /api/login, /api/create-blog)
    const directLogin = await fetch(`http://localhost:5000/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'password123' })
    });
    await assert('Convenience route POST /api/login functions properly', directLogin.status === 200);

    console.log(`\n--- Test Summary: ${failures === 0 ? 'ALL TESTS PASSED! 🎉' : `${failures} FAILURE(S)`} ---`);
  } catch (err) {
    console.error('Test execution error:', err);
    failures++;
  } finally {
    server.close();
    process.exit(failures === 0 ? 0 : 1);
  }
}

setTimeout(runTests, 500);
