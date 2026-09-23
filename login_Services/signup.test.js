const test = require('node:test');
const assert = require('node:assert/strict');
const loginSchema = require('./schemas/customer_Schema');

process.env.JWT = 'test-only-signing-key';
const { createUser } = require('./controllers/login');

test('password signup creates a session without OTP and marks email unverified', async () => {
    const originalCreate = loginSchema.create;
    let saved;
    let cookie;
    try {
        loginSchema.create = async value => {
            saved = value;
            return { ...value, _id: 'new-user' };
        };
        const res = {
            code: 200,
            cookie(name, value, options) { cookie = { name, value, options }; return this; },
            status(value) { this.code = value; return this; },
            json(value) { this.body = value; return this; }
        };

        await createUser({ body: { name: 'New User', email: 'new@example.com', password: 'test-password' } }, res);

        assert.equal(res.code, 201);
        assert.equal(saved.emailVerified, false);
        assert.equal(saved.last_verified, undefined);
        assert.equal(cookie.name, 'token');
        assert.equal(cookie.options.httpOnly, true);
        assert.equal(res.body.authenticated, true);
        assert.equal(res.body.user._id, 'new-user');
        assert.equal(res.body.user.password, undefined);
    } finally {
        loginSchema.create = originalCreate;
    }
});
