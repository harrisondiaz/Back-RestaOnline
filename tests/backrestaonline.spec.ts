// @ts-check
const { test, expect, chromium } = require('@playwright/test');
const { request } = require('express');

test('Get users', async ({request}) => {
  const response = await request.get('https://back-restaonline-production.up.railway.app/api/users');
  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(response.statusText()).toBe('OK');
  expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
  expect(response.headers()['access-control-allow-origin']).toBe('*');
  expect(response.headers()['x-powered-by']).toBe('Express');
  console.log(await response.json());
});


test('Get Dishes', async ({ request }) => {
    const response = await request.get(`https://back-restaonline-production.up.railway.app/api/dishes`)
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);
    expect(response.statusText()).toBe('OK');
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['x-powered-by']).toBe('Express');
    console.log(await response.json());
  
});

test('Get Addons', async ({ request }) => {
    const response = await request.get(`https://back-restaonline-production.up.railway.app/api/addons`)
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);
    expect(response.statusText()).toBe('OK');
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['x-powered-by']).toBe('Express');
    console.log(await response.json());
});

test('Get Orders', async ({ request }) => {
    const response = await request.get(`https://back-restaonline-production.up.railway.app/api/orders`)
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);
    expect(response.statusText()).toBe('OK');
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['x-powered-by']).toBe('Express');
    console.log(await response.json());
});

test('Get id Dish', async ({ request }) => {
    const response = await request.get(`https://back-restaonline-production.up.railway.app/api/dishes/1`)
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true);
    expect(response.statusText()).toBe('OK');
    expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
    expect(response.headers()['access-control-allow-origin']).toBe('*');
    expect(response.headers()['x-powered-by']).toBe('Express');
    expect(response.headers()['etag']).toBe('W/"1a2-AH00utNBOvQP1U1jr0ISwgtgJ/8\"');
    console.log(await response.json());
});

test('Get Bad id Dish', async ({ request }) => {
  const response = await request.get(`https://back-restaonline-production.up.railway.app/api/dishes/101`)
  expect(response.status()).toBe(404);
  expect(response.ok()).toBe(false);
  expect(response.statusText()).toBe('Not Found');
  expect(response.headers()['content-type']).toBe('text/html; charset=utf-8');
  expect(response.headers()['x-powered-by']).toBe('Express');
  expect(response.headers()['etag']).toBe('W/"1a-gUhsfpsziFAERAr9Z6Puif7OBsQ\"');
});

test('Get id Addon', async ({ request }) => {
  const response = await request.get(`https://back-restaonline-production.up.railway.app/api/addons/Cerveza`)
  expect(response.status()).toBe(200);
  expect(response.ok()).toBe(true);
  expect(response.statusText()).toBe('OK');
  expect(response.headers()['content-type']).toBe('application/json; charset=utf-8');
  expect(response.headers()['access-control-allow-origin']).toBe('*');
  expect(response.headers()['x-powered-by']).toBe('Express');
  expect(response.headers()['etag']).toBe('W/"1c-SbWhLewFXB8eYORVeOFZDsuPNJY\"');
  console.log(await response.json());
});

test('Get Bad id Addon', async ({ request }) => {
const response = await request.get(`https://back-restaonline-production.up.railway.app/api/addons/Huevo Revuelto`)
expect(response.status()).toBe(404);
expect(response.ok()).toBe(false);
expect(response.statusText()).toBe('Not Found');
expect(response.headers()['content-type']).toBe('text/html; charset=utf-8');
expect(response.headers()['x-powered-by']).toBe('Express');
expect(response.headers()['etag']).toBe('W/"28-f9NNZ4KkQX/4xvHpuB+toh0RYVE\"');
});
