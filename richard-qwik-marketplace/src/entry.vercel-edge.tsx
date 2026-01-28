/*
 * Vercel Edge Entry Point
 * This file configures the Qwik application to run on Vercel's Edge infrastructure.
 */
import { createQwikCity } from '@builder.io/qwik-city/middleware/vercel-edge';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';

export default createQwikCity({ render, qwikCityPlan, manifest });
