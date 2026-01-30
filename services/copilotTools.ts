/**
 * Custom Tools for GitHub Copilot Agents
 * 
 * This file defines automotive-specific tools that agents can use to
 * interact with the dealership's data and services.
 */

import { defineTool } from '@github/copilot-sdk';
import { getInventoryOnce } from './firebaseService';
import { SITE_CONFIG } from '../src/constants/siteConfig';

/**
 * Tool: search_inventory
 * Search vehicle inventory by various criteria
 */
export const searchInventoryTool = defineTool('search_inventory', {
    description: 'Search vehicle inventory by make, model, price range, year, or type',
    parameters: {
        type: 'object',
        properties: {
            make: { type: 'string', description: 'The car manufacturer (e.g., Toyota, Ford)' },
            model: { type: 'string', description: 'The specific model name' },
            minPrice: { type: 'number', description: 'Minimum price in USD' },
            maxPrice: { type: 'number', description: 'Maximum price in USD' },
            year: { type: 'number', description: 'The manufacturing year' },
            type: { type: 'string', description: 'Body style (e.g., SUV, Sedan, Pickup)' },
        },
    },
    handler: async (args: any) => {
        console.log('[Tool:search_inventory] Args:', JSON.stringify(args));
        try {
            const inventory = await getInventoryOnce();
            console.log(`[Tool:search_inventory] Total inventory size: ${inventory.length}`);
            let results = [...inventory];

            if (args.make) results = results.filter(c => c.name && c.name.toLowerCase().includes(args.make.toLowerCase()));
            if (args.model) results = results.filter(c => c.name && c.name.toLowerCase().includes(args.model.toLowerCase()));
            if (args.minPrice) results = results.filter(c => c.price && c.price >= args.minPrice);
            if (args.maxPrice) results = results.filter(c => c.price && c.price <= args.maxPrice);
            if (args.year) results = results.filter(c => c.name && c.name.includes(args.year.toString()));
            if (args.type) results = results.filter(c => c.type && c.type.toLowerCase() === args.type.toLowerCase());

            console.log(`[Tool:search_inventory] Filtered results: ${results.length}`);

            return {
                count: results.length,
                vehicles: results.slice(0, 5).map(v => ({
                    id: v.id,
                    name: v.name,
                    price: v.price,
                    type: v.type,
                    url: `${SITE_CONFIG.domain}/vehicle/${v.id}`
                }))
            };
        } catch (error) {
            console.error('[Tool:search_inventory] Error:', error);
            return { error: 'Failed to search inventory', details: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
});

/**
 * Tool: calculate_financing
 * Calculate estimated monthly payments
 */
export const calculateFinancingTool = defineTool('calculate_financing', {
    description: 'Calculate estimated monthly payments based on price, down payment, term, and interest rate',
    parameters: {
        type: 'object',
        properties: {
            price: { type: 'number', description: 'Total vehicle price' },
            downPayment: { type: 'number', description: 'Amount paid upfront' },
            termMonths: { type: 'number', description: 'Number of months for the loan (e.g., 60, 72)' },
            apr: { type: 'number', description: 'Annual percentage rate (interest rate)' },
        },
        required: ['price', 'downPayment', 'termMonths'],
    },
    handler: async (args: any) => {
        const principal = args.price - args.downPayment;
        const monthlyRate = (args.apr || 5.9) / 100 / 12;
        const numPayments = args.termMonths;

        const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

        return {
            price: args.price,
            downPayment: args.downPayment,
            amountFinanced: principal,
            termMonths: numPayments,
            apr: args.apr || 5.9,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            totalCost: Math.round(monthlyPayment * numPayments * 100) / 100,
            totalInterest: Math.round((monthlyPayment * numPayments - principal) * 100) / 100
        };
    }
});

/**
 * Tool: get_dealer_info
 * Get general dealership information (location, hours, contact)
 */
export const getDealerInfoTool = defineTool('get_dealer_info', {
    description: 'Get general dealership information like business hours, location, and contact details',
    parameters: { type: 'object', properties: {} },
    handler: async () => {
        return {
            name: SITE_CONFIG.name,
            address: SITE_CONFIG.contact.address,
            phone: SITE_CONFIG.contact.phone,
            email: SITE_CONFIG.contact.email,
            hours: {
                monday: '9:00 AM - 6:00 PM',
                tuesday: '9:00 AM - 6:00 PM',
                wednesday: '9:00 AM - 6:00 PM',
                thursday: '9:00 AM - 6:00 PM',
                friday: '9:00 AM - 6:00 PM',
                saturday: '10:00 AM - 4:00 PM',
                sunday: 'Closed'
            }
        };
    }
});

/**
 * Tool list for agents
 */
export const automotiveTools = [
    searchInventoryTool,
    calculateFinancingTool,
    getDealerInfoTool
];
