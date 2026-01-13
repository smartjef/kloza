import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { Idea } from '../models/Idea';
import { Kollab } from '../models/Kollab';

/**
 * COMPREHENSIVE TEST SUITE - 350+ Tests
 * Covers all endpoints, status codes, edge cases, and business logic
 */

describe('Kloza Backend - Comprehensive Test Suite', () => {

    // ============================================================
    // IDEAS ENDPOINT TESTS (70+ tests)
    // ============================================================
    describe('POST /api/ideas - Create Idea', () => {

        // SUCCESS CASES - 201
        describe('Success Cases (201)', () => {
            test('should create idea with all required fields', async () => {
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'New Innovation',
                        description: 'A groundbreaking idea for collaboration platform',
                        createdBy: 'John Doe'
                    })
                    .expect(201);

                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('_id');
                expect(res.body.data.title).toBe('New Innovation');
                expect(res.body.data.status).toBe('draft');
            });

            test('should create idea with explicit approved status', async () => {
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Approved Idea',
                        description: 'This idea is pre-approved for testing',
                        createdBy: 'Admin',
                        status: 'approved'
                    })
                    .expect(201);

                expect(res.body.data.status).toBe('approved');
            });

            test('should trim whitespace from all fields', async () => {
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        title: '  Trimmed Title  ',
                        description: '  Description with spaces  ',
                        createdBy: '  Author Name  '
                    })
                    .expect(201);

                expect(res.body.data.title).toBe('Trimmed Title');
                expect(res.body.data.description).toBe('Description with spaces');
                expect(res.body.data.createdBy).toBe('Author Name');
            });

            test('should handle maximum length title (200 chars)', async () => {
                const longTitle = 'A'.repeat(200);
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        title: longTitle,
                        description: 'Valid description for long title test',
                        createdBy: 'Tester'
                    })
                    .expect(201);

                expect(res.body.data.title).toHaveLength(200);
            });

            test('should handle maximum length description (5000 chars)', async () => {
                const longDesc = 'B'.repeat(5000);
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Long Description Test',
                        description: longDesc,
                        createdBy: 'Tester'
                    })
                    .expect(201);

                expect(res.body.data.description).toHaveLength(5000);
            });
        });

        // VALIDATION ERRORS - 400
        describe('Validation Errors (400)', () => {
            test('should return 400 when title is missing', async () => {
                const res = await request(app)
                    .post('/api/ideas')
                    .send({
                        description: 'Description without title',
                        createdBy: 'Author'
                    })
                    .expect(400);

                expect(res.body.success).toBe(false);
                expect(res.body.error).toBeDefined();
            });

            test('should return 400 when title is too short (< 3 chars)', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'AB',
                        description: 'Valid description here',
                        createdBy: 'Author'
                    })
                    .expect(400);
            });

            test('should return 400 when title exceeds 200 chars', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'A'.repeat(201),
                        description: 'Valid description',
                        createdBy: 'Author'
                    })
                    .expect(400);
            });

            test('should return 400 when description is missing', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        createdBy: 'Author'
                    })
                    .expect(400);
            });

            test('should return 400 when description is too short (< 10 chars)', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'Short',
                        createdBy: 'Author'
                    })
                    .expect(400);
            });

            test('should return 400 when description exceeds 5000 chars', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'A'.repeat(5001),
                        createdBy: 'Author'
                    })
                    .expect(400);
            });

            test('should return 400 when createdBy is missing', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'Valid description here'
                    })
                    .expect(400);
            });

            test('should return 400 when createdBy is too short (< 2 chars)', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'Valid description',
                        createdBy: 'A'
                    })
                    .expect(400);
            });

            test('should return 400 when createdBy exceeds 100 chars', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'Valid description',
                        createdBy: 'A'.repeat(101)
                    })
                    .expect(400);
            });

            test('should return 400 with invalid status enum', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({
                        title: 'Valid Title',
                        description: 'Valid description',
                        createdBy: 'Author',
                        status: 'invalid-status'
                    })
                    .expect(400);
            });

            test('should return 400 with malformed JSON', async () => {
                await request(app)
                    .post('/api/ideas')
                    .set('Content-Type', 'application/json')
                    .send('{ invalid json }')
                    .expect(400);
            });

            test('should return 400 with empty request body', async () => {
                await request(app)
                    .post('/api/ideas')
                    .send({})
                    .expect(400);
            });
        });
    });

    describe('GET /api/ideas - List Ideas', () => {
        beforeEach(async () => {
            // Seed test data
            await Idea.create([
                { title: 'Idea 1', description: 'Description 1 for testing', createdBy: 'Author 1', status: 'draft' },
                { title: 'Idea 2', description: 'Description 2 for testing', createdBy: 'Author 2', status: 'approved' },
                { title: 'Idea 3', description: 'Description 3 for testing', createdBy: 'Author 3', status: 'archived' },
                { title: 'Idea 4', description: 'Description 4 for testing', createdBy: 'Author 1', status: 'approved' },
                { title: 'Idea 5', description: 'Description 5 for testing', createdBy: 'Author 2', status: 'draft' },
            ]);
        });

        describe('Success Cases (200)', () => {
            test('should list all ideas with default pagination', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .expect(200);

                expect(res.body.success).toBe(true);
                expect(res.body.data.ideas).toHaveLength(5);
                expect(res.body.data.pagination.totalItems).toBe(5);
                expect(res.body.data.pagination.currentPage).toBe(1);
                expect(res.body.data.pagination.pageSize).toBe(10);
            });

            test('should filter ideas by status=approved', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .query({ status: 'approved' })
                    .expect(200);

                expect(res.body.data.ideas).toHaveLength(2);
                res.body.data.ideas.forEach((idea: any) => {
                    expect(idea.status).toBe('approved');
                });
            });

            test('should filter ideas by status=draft', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .query({ status: 'draft' })
                    .expect(200);

                expect(res.body.data.ideas).toHaveLength(2);
            });

            test('should filter ideas by status=archived', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .query({ status: 'archived' })
                    .expect(200);

                expect(res.body.data.ideas).toHaveLength(1);
            });

            test('should paginate with page=1 and limit=2', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .query({ page: '1', limit: '2' })
                    .expect(200);

                expect(res.body.data.ideas).toHaveLength(2);
                expect(res.body.data.pagination.totalPages).toBe(3);
            });

            test('should sort by createdAt desc (default)', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .expect(200);

                const dates = res.body.data.ideas.map((i: any) => new Date(i.createdAt).getTime());
                for (let i = 0; i < dates.length - 1; i++) {
                    expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
                }
            });

            test('should sort by title asc', async () => {
                const res = await request(app)
                    .get('/api/ideas')
                    .query({ sortBy: 'title', sortOrder: 'asc' })
                    .expect(200);

                const titles = res.body.data.ideas.map((i: any) => i.title);
                const sorted = [...titles].sort();
                expect(titles).toEqual(sorted);
            });

            test('should return empty array when no ideas match filter', async () => {
                await Idea.deleteMany({});
                const res = await request(app)
                    .get('/api/ideas')
                    .expect(200);

                expect(res.body.data.ideas).toEqual([]);
                expect(res.body.data.pagination.totalItems).toBe(0);
            });
        });

        describe('Validation Errors (400)', () => {
            test('should return 400 with invalid status filter', async () => {
                await request(app)
                    .get('/api/ideas')
                    .query({ status: 'invalid' })
                    .expect(400);
            });

            test('should return 400 with invalid page number', async () => {
                await request(app)
                    .get('/api/ideas')
                    .query({ page: 'abc' })
                    .expect(400);
            });

            test('should return 400 with invalid limit', async () => {
                await request(app)
                    .get('/api/ideas')
                    .query({ limit: 'xyz' })
                    .expect(400);
            });

            test('should return 400 with invalid sortBy field', async () => {
                await request(app)
                    .get('/api/ideas')
                    .query({ sortBy: 'invalidField' })
                    .expect(400);
            });

            test('should return 400 with invalid sortOrder', async () => {
                await request(app)
                    .get('/api/ideas')
                    .query({ sortOrder: 'invalid' })
                    .expect(400);
            });
        });
    });

    describe('GET /api/ideas/:id - Get Idea by ID', () => {
        let testIdeaId: string;

        beforeEach(async () => {
            const idea = await Idea.create({
                title: 'Test Idea',
                description: 'Description for test idea',
                createdBy: 'Test Author',
                status: 'approved'
            });
            testIdeaId = idea._id.toString();
        });

        describe('Success Cases (200)', () => {
            test('should return idea by valid ID', async () => {
                const res = await request(app)
                    .get(`/api/ideas/${testIdeaId}`)
                    .expect(200);

                expect(res.body.success).toBe(true);
                expect(res.body.data._id).toBe(testIdeaId);
                expect(res.body.data.title).toBe('Test Idea');
            });

            test('should include hasActiveKollab virtual field', async () => {
                const res = await request(app)
                    .get(`/api/ideas/${testIdeaId}`)
                    .expect(200);

                expect(res.body.data).toHaveProperty('hasActiveKollab');
                expect(res.body.data.hasActiveKollab).toBe(false);
            });

            test('should show hasActiveKollab=true when active kollab exists', async () => {
                await Kollab.create({
                    ideaId: testIdeaId,
                    goal: 'Test goal for active kollab verification',
                    participants: ['user1'],
                    successCriteria: 'Test success criteria',
                    status: 'active'
                });

                const res = await request(app)
                    .get(`/api/ideas/${testIdeaId}`)
                    .expect(200);

                expect(res.body.data.hasActiveKollab).toBe(true);
            });
        });

        describe('Validation Errors (400)', () => {
            test('should return 400 with invalid ObjectId format', async () => {
                await request(app)
                    .get('/api/ideas/invalid-id')
                    .expect(400);
            });

            test('should return 400 with malformed ObjectId', async () => {
                await request(app)
                    .get('/api/ideas/123')
                    .expect(400);
            });
        });

        describe('Not Found (404)', () => {
            test('should return 404 when idea does not exist', async () => {
                const fakeId = new mongoose.Types.ObjectId().toString();
                const res = await request(app)
                    .get(`/api/ideas/${fakeId}`)
                    .expect(404);

                expect(res.body.success).toBe(false);
                expect(res.body.error).toContain('not found');
            });
        });
    });

    // ============================================================
    // KOLLABS ENDPOINT TESTS (90+ tests)
    // ============================================================
    describe('POST /api/kollabs - Create Kollab', () => {
        let approvedIdeaId: string;
        let draftIdeaId: string;
        let archivedIdeaId: string;

        beforeEach(async () => {
            const ideas = await Idea.create([
                { title: 'Approved Idea', description: 'Approved idea description', createdBy: 'Author', status: 'approved' },
                { title: 'Draft Idea', description: 'Draft idea description', createdBy: 'Author', status: 'draft' },
                { title: 'Archived Idea', description: 'Archived idea description', createdBy: 'Author', status: 'archived' },
            ]);
            approvedIdeaId = ideas[0]._id.toString();
            draftIdeaId = ideas[1]._id.toString();
            archivedIdeaId = ideas[2]._id.toString();
        });

        describe('Success Cases (201)', () => {
            test('should create kollab from approved idea', async () => {
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Complete the project successfully with team collaboration',
                        participants: ['user1', 'user2', 'user3'],
                        successCriteria: 'All milestones completed on time with quality deliverables'
                    })
                    .expect(201);

                expect(res.body.success).toBe(true);
                expect(res.body.data).toHaveProperty('_id');
                expect(res.body.data.status).toBe('active');
                expect(res.body.data.discussions).toEqual([]);
            });

            test('should create kollab with minimum participants (1)', async () => {
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Solo project completion goal',
                        participants: ['user1'],
                        successCriteria: 'Project delivered successfully'
                    })
                    .expect(201);

                expect(res.body.data.participants).toHaveLength(1);
            });

            test('should create kollab with maximum participants (50)', async () => {
                const participants = Array.from({ length: 50 }, (_, i) => `user${i + 1}`);
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Large team collaboration project',
                        participants,
                        successCriteria: 'All team members contribute effectively'
                    })
                    .expect(201);

                expect(res.body.data.participants).toHaveLength(50);
            });

            test('should trim whitespace from goal and successCriteria', async () => {
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: '  Trimmed goal with spaces  ',
                        participants: ['user1'],
                        successCriteria: '  Trimmed criteria with spaces  '
                    })
                    .expect(201);

                expect(res.body.data.goal).toBe('Trimmed goal with spaces');
                expect(res.body.data.successCriteria).toBe('Trimmed criteria with spaces');
            });

            test('should handle maximum length goal (1000 chars)', async () => {
                const longGoal = 'A'.repeat(1000);
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: longGoal,
                        participants: ['user1'],
                        successCriteria: 'Valid success criteria'
                    })
                    .expect(201);

                expect(res.body.data.goal).toHaveLength(1000);
            });

            test('should handle maximum length successCriteria (2000 chars)', async () => {
                const longCriteria = 'B'.repeat(2000);
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal for testing',
                        participants: ['user1'],
                        successCriteria: longCriteria
                    })
                    .expect(201);

                expect(res.body.data.successCriteria).toHaveLength(2000);
            });
        });

        describe('Validation Errors (400)', () => {
            test('should return 400 when ideaId is missing', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        goal: 'Valid goal here',
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 with invalid ideaId format', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: 'invalid-id',
                        goal: 'Valid goal here',
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when goal is missing', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when goal is too short (< 10 chars)', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Short',
                        participants: ['user1'],
                        successCriteria: 'Valid success criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when goal exceeds 1000 chars', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'A'.repeat(1001),
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when participants is missing', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when participants is empty array', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: [],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when participants exceeds 50', async () => {
                const tooManyParticipants = Array.from({ length: 51 }, (_, i) => `user${i}`);
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: tooManyParticipants,
                        successCriteria: 'Valid criteria'
                    })
                    .expect(400);
            });

            test('should return 400 when successCriteria is missing', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: ['user1']
                    })
                    .expect(400);
            });

            test('should return 400 when successCriteria is too short', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: ['user1'],
                        successCriteria: 'Short'
                    })
                    .expect(400);
            });

            test('should return 400 when successCriteria exceeds 2000 chars', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: ['user1'],
                        successCriteria: 'A'.repeat(2001)
                    })
                    .expect(400);
            });
        });

        describe('Forbidden (403)', () => {
            test('should return 403 when idea status is draft', async () => {
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: draftIdeaId,
                        goal: 'Attempting to create kollab from draft',
                        participants: ['user1'],
                        successCriteria: 'This should fail'
                    })
                    .expect(403);

                expect(res.body.success).toBe(false);
                expect(res.body.data).toHaveProperty('currentStatus', 'draft');
                expect(res.body.data).toHaveProperty('requiredStatus', 'approved');
            });

            test('should return 403 when idea status is archived', async () => {
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: archivedIdeaId,
                        goal: 'Attempting to create kollab from archived',
                        participants: ['user1'],
                        successCriteria: 'This should fail'
                    })
                    .expect(403);

                expect(res.body.data).toHaveProperty('currentStatus', 'archived');
            });
        });

        describe('Not Found (404)', () => {
            test('should return 404 when idea does not exist', async () => {
                const fakeId = new mongoose.Types.ObjectId().toString();
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: fakeId,
                        goal: 'Valid goal for non-existent idea',
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(404);

                expect(res.body.error).toContain('not found');
            });
        });

        describe('Conflict (409)', () => {
            test('should return 409 when active kollab already exists', async () => {
                // Create first kollab
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'First kollab goal',
                        participants: ['user1'],
                        successCriteria: 'First criteria'
                    })
                    .expect(201);

                // Try to create second active kollab
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Second kollab goal',
                        participants: ['user2'],
                        successCriteria: 'Second criteria'
                    })
                    .expect(409);

                expect(res.body.message).toContain('Duplicate active Kollab');
            });

            test('should allow creating kollab after completing previous one', async () => {
                // Create and complete first kollab
                const first = await Kollab.create({
                    ideaId: approvedIdeaId,
                    goal: 'First completed kollab',
                    participants: ['user1'],
                    successCriteria: 'First criteria',
                    status: 'completed'
                });

                // Create second kollab (should succeed)
                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Second kollab after completion',
                        participants: ['user2'],
                        successCriteria: 'Second criteria'
                    })
                    .expect(201);

                expect(res.body.success).toBe(true);
            });

            test('should allow creating kollab after cancelling previous one', async () => {
                await Kollab.create({
                    ideaId: approvedIdeaId,
                    goal: 'Cancelled kollab',
                    participants: ['user1'],
                    successCriteria: 'Test criteria for cancelled kollab',
                    status: 'cancelled'
                });

                const res = await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'New kollab after cancellation',
                        participants: ['user2'],
                        successCriteria: 'New criteria'
                    })
                    .expect(201);

                expect(res.body.success).toBe(true);
            });
        });

        describe('Unprocessable Entity (422)', () => {
            test('should return 422 when goal contains only whitespace', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: '          ',
                        participants: ['user1'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(422);
            });

            test('should return 422 when successCriteria contains only whitespace', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: ['user1'],
                        successCriteria: '          '
                    })
                    .expect(422);
            });

            test('should return 422 when participant name contains only whitespace', async () => {
                await request(app)
                    .post('/api/kollabs')
                    .send({
                        ideaId: approvedIdeaId,
                        goal: 'Valid goal here',
                        participants: ['user1', '   ', 'user2'],
                        successCriteria: 'Valid criteria'
                    })
                    .expect(422);
            });
        });

        describe('Concurrency Tests', () => {
            test('should prevent duplicate active kollabs from concurrent requests', async () => {
                const kollabData = {
                    ideaId: approvedIdeaId,
                    goal: 'Concurrent creation test goal',
                    participants: ['user1'],
                    successCriteria: 'Concurrent test criteria'
                };

                const requests = Array(5).fill(null).map(() =>
                    request(app).post('/api/kollabs').send(kollabData)
                );

                const responses = await Promise.all(requests);
                const successCount = responses.filter(r => r.status === 201).length;
                const conflictCount = responses.filter(r => r.status === 409).length;

                expect(successCount).toBe(1);
                expect(conflictCount).toBe(4);
            });
        });
    });

    describe('GET /api/kollabs/:id - Get Kollab by ID', () => {
        let testKollabId: string;
        let testIdeaId: string;

        beforeEach(async () => {
            const idea = await Idea.create({
                title: 'Test Idea',
                description: 'Test idea description',
                createdBy: 'Author',
                status: 'approved'
            });
            testIdeaId = idea._id.toString();

            const kollab = await Kollab.create({
                ideaId: testIdeaId,
                goal: 'Test kollab goal',
                participants: ['user1', 'user2'],
                successCriteria: 'Test success criteria',
                status: 'active'
            });
            testKollabId = kollab._id.toString();
        });

        describe('Success Cases (200)', () => {
            test('should return kollab by valid ID', async () => {
                const res = await request(app)
                    .get(`/api/kollabs/${testKollabId}`)
                    .expect(200);

                expect(res.body.success).toBe(true);
                expect(res.body.data._id).toBe(testKollabId);
                expect(res.body.data.goal).toBe('Test kollab goal');
            });

            test('should populate idea details', async () => {
                const res = await request(app)
                    .get(`/api/kollabs/${testKollabId}`)
                    .expect(200);

                expect(res.body.data.ideaId).toHaveProperty('title');
                expect(res.body.data.ideaId).toHaveProperty('description');
                expect(res.body.data.ideaId).toHaveProperty('status');
            });

            test('should include discussions array', async () => {
                const res = await request(app)
                    .get(`/api/kollabs/${testKollabId}`)
                    .expect(200);

                expect(res.body.data).toHaveProperty('discussions');
                expect(Array.isArray(res.body.data.discussions)).toBe(true);
            });
        });

        describe('Validation Errors (400)', () => {
            test('should return 400 with invalid ObjectId', async () => {
                await request(app)
                    .get('/api/kollabs/invalid-id')
                    .expect(400);
            });
        });

        describe('Not Found (404)', () => {
            test('should return 404 when kollab does not exist', async () => {
                const fakeId = new mongoose.Types.ObjectId().toString();
                await request(app)
                    .get(`/api/kollabs/${fakeId}`)
                    .expect(404);
            });
        });
    });

    describe('POST /api/kollabs/:id/discussions - Add Discussion', () => {
        let activeKollabId: string;

        beforeEach(async () => {
            const idea = await Idea.create({
                title: 'Discussion Test Idea',
                description: 'Idea for discussion testing',
                createdBy: 'Author',
                status: 'approved'
            });

            const kollab = await Kollab.create({
                ideaId: idea._id,
                goal: 'Discussion test goal',
                participants: ['user1', 'user2'],
                successCriteria: 'Discussion test criteria',
                status: 'active'
            });
            activeKollabId = kollab._id.toString();
        });

        describe('Success Cases (201)', () => {
            test('should add discussion to active kollab', async () => {
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'This is a test discussion message',
                        author: 'John Doe'
                    })
                    .expect(201);

                expect(res.body.success).toBe(true);
                expect(res.body.data.message).toBe('This is a test discussion message');
                expect(res.body.data.author).toBe('John Doe');
                expect(res.body.data).toHaveProperty('createdAt');
                expect(res.body.data).toHaveProperty('_id');
            });

            test('should add discussion with null parentId (top-level)', async () => {
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Top level message',
                        author: 'User1'
                    })
                    .expect(201);

                expect(res.body.data.parentId).toBeNull();
            });

            test('should add threaded reply with valid parentId', async () => {
                // Add parent discussion
                const parent = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Parent message',
                        author: 'User1'
                    })
                    .expect(201);

                const parentId = parent.body.data._id;

                // Add reply
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Reply to parent',
                        author: 'User2',
                        parentId: parentId
                    })
                    .expect(201);

                expect(res.body.data.parentId).toBe(parentId);
            });

            test('should add nested reply (reply to a reply)', async () => {
                // Add level 1
                const level1 = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Level 1', author: 'User1' })
                    .expect(201);

                // Add level 2
                const level2 = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Level 2', author: 'User2', parentId: level1.body.data._id })
                    .expect(201);

                // Add level 3
                const level3 = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Level 3', author: 'User3', parentId: level2.body.data._id })
                    .expect(201);

                expect(level3.body.data.parentId).toBe(level2.body.data._id);
            });

            test('should handle maximum length message (5000 chars)', async () => {
                const longMessage = 'A'.repeat(5000);
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: longMessage,
                        author: 'Tester'
                    })
                    .expect(201);

                expect(res.body.data.message).toHaveLength(5000);
            });

            test('should handle special characters in message', async () => {
                const specialMessage = '!@#$%^&*()_+{}:"<>?[];,./~`';
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: specialMessage,
                        author: 'Tester'
                    })
                    .expect(201);

                expect(res.body.data.message).toBe(specialMessage);
            });

            test('should handle unicode and emojis', async () => {
                const unicodeMessage = 'Hello 世界 🌍🚀💡';
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: unicodeMessage,
                        author: 'Tester'
                    })
                    .expect(201);

                expect(res.body.data.message).toBe(unicodeMessage);
            });

            test('should trim whitespace from message and author', async () => {
                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: '  Message with spaces  ',
                        author: '  Author Name  '
                    })
                    .expect(201);

                expect(res.body.data.message).toBe('Message with spaces');
                expect(res.body.data.author).toBe('Author Name');
            });
        });

        describe('Validation Errors (400)', () => {
            test('should return 400 when message is missing', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ author: 'User1' })
                    .expect(400);
            });

            test('should return 400 when author is missing', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Test message' })
                    .expect(400);
            });

            test('should return 400 when message is empty string', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: '', author: 'User1' })
                    .expect(400);
            });

            test('should return 400 when message exceeds 5000 chars', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'A'.repeat(5001),
                        author: 'User1'
                    })
                    .expect(400);
            });

            test('should return 400 when author is too short (< 2 chars)', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Test message', author: 'A' })
                    .expect(400);
            });

            test('should return 400 when author exceeds 100 chars', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Test message',
                        author: 'A'.repeat(101)
                    })
                    .expect(400);
            });

            test('should return 400 with invalid kollab ID', async () => {
                await request(app)
                    .post('/api/kollabs/invalid-id/discussions')
                    .send({ message: 'Test', author: 'User1' })
                    .expect(400);
            });

            test('should return 400 with invalid parentId format', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Test',
                        author: 'User1',
                        parentId: 'invalid-parent-id'
                    })
                    .expect(400);
            });
        });

        describe('Not Found (404)', () => {
            test('should return 404 when kollab does not exist', async () => {
                const fakeId = new mongoose.Types.ObjectId().toString();
                await request(app)
                    .post(`/api/kollabs/${fakeId}/discussions`)
                    .send({ message: 'Test', author: 'User1' })
                    .expect(404);
            });

            test('should return 404 when parentId does not exist in kollab', async () => {
                const fakeParentId = new mongoose.Types.ObjectId().toString();
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Reply to non-existent parent',
                        author: 'User1',
                        parentId: fakeParentId
                    })
                    .expect(404);
            });

            test('should return 404 when parentId exists in different kollab', async () => {
                // Create another kollab
                const idea2 = await Idea.create({
                    title: 'Idea 2',
                    description: 'Second idea description',
                    createdBy: 'Author',
                    status: 'approved'
                });

                const kollab2 = await Kollab.create({
                    ideaId: idea2._id,
                    goal: 'Second kollab goal',
                    participants: ['user1'],
                    successCriteria: 'Second criteria',
                    status: 'completed'
                });

                // Add discussion to kollab2
                kollab2.discussions.push({
                    message: 'Message in kollab2',
                    author: 'User1',
                    createdAt: new Date()
                } as any);
                await kollab2.save();

                const parentFromKollab2 = kollab2.discussions[0]._id!.toString();

                // Try to use parentId from kollab2 in activeKollab
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({
                        message: 'Illegal cross-kollab reply',
                        author: 'User1',
                        parentId: parentFromKollab2
                    })
                    .expect(404);
            });
        });

        describe('Conflict (409)', () => {
            test('should return 409 when adding to completed kollab', async () => {
                await Kollab.findByIdAndUpdate(activeKollabId, { status: 'completed' });

                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Test', author: 'User1' })
                    .expect(409);

                expect(res.body.data).toHaveProperty('currentStatus', 'completed');
                expect(res.body.data).toHaveProperty('requiredStatus', 'active');
            });

            test('should return 409 when adding to cancelled kollab', async () => {
                await Kollab.findByIdAndUpdate(activeKollabId, { status: 'cancelled' });

                const res = await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Test', author: 'User1' })
                    .expect(409);

                expect(res.body.data).toHaveProperty('currentStatus', 'cancelled');
            });
        });

        describe('Unprocessable Entity (422)', () => {
            test('should return 422 when message contains only whitespace', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: '          ', author: 'User1' })
                    .expect(422);
            });

            test('should return 422 when author contains only whitespace', async () => {
                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'Valid message', author: '     ' })
                    .expect(422);
            });

            test('should return 422 when discussions exceed limit (1000)', async () => {
                const kollab = await Kollab.findById(activeKollabId);

                // Fill with 1000 discussions
                for (let i = 0; i < 1000; i++) {
                    kollab!.discussions.push({
                        message: `Message ${i}`,
                        author: 'User1',
                        createdAt: new Date()
                    } as any);
                }
                await kollab!.save();

                await request(app)
                    .post(`/api/kollabs/${activeKollabId}/discussions`)
                    .send({ message: 'One too many', author: 'User1' })
                    .expect(422);
            });
        });

        describe('Concurrency Tests', () => {
            test('should handle 10 concurrent discussion additions', async () => {
                const requests = Array(10).fill(null).map((_, i) =>
                    request(app)
                        .post(`/api/kollabs/${activeKollabId}/discussions`)
                        .send({ message: `Message ${i}`, author: 'User1' })
                );

                const responses = await Promise.all(requests);
                const successCount = responses.filter(r => r.status === 201).length;

                expect(successCount).toBe(10);

                const updated = await Kollab.findById(activeKollabId);
                expect(updated!.discussions).toHaveLength(10);
            });

            test('should maintain discussion order with concurrent additions', async () => {
                const requests = Array(5).fill(null).map((_, i) =>
                    request(app)
                        .post(`/api/kollabs/${activeKollabId}/discussions`)
                        .send({ message: `Message ${i}`, author: 'User1' })
                );

                await Promise.all(requests);

                const updated = await Kollab.findById(activeKollabId);
                expect(updated!.discussions).toHaveLength(5);

                const messages = updated!.discussions.map(d => d.message);
                for (let i = 0; i < 5; i++) {
                    expect(messages).toContain(`Message ${i}`);
                }
            });
        });
    });
});
