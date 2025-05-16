import { Schema, model, Document } from 'mongoose';

// Project Schema
export interface IProject extends Document {
    name: string;
    description: string;
    website: string;
    githubUrl: string;
    twitterUrl: string;
    contracts: IContract[];
    socialMetrics: ISocialMetrics;
    createdAt: Date;
    updatedAt: Date;
}

export interface IContract extends Document {
    name: string;
    address: string;
    type: string;
    interactions: number;
    lastInteraction: Date;
}

export interface ISocialMetrics extends Document {
    githubStars: number;
    githubForks: number;
    githubLastUpdate: Date;
    twitterFollowers: number;
    twitterLastUpdate: Date;
    projectFreshness: number; // Calculated score based on activity
}

const ContractSchema = new Schema<IContract>({
    name: { type: String, required: true },
    address: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    interactions: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now }
});

const SocialMetricsSchema = new Schema<ISocialMetrics>({
    githubStars: { type: Number, default: 0 },
    githubForks: { type: Number, default: 0 },
    githubLastUpdate: { type: Date, default: Date.now },
    twitterFollowers: { type: Number, default: 0 },
    twitterLastUpdate: { type: Date, default: Date.now },
    projectFreshness: { type: Number, default: 0 }
});

const ProjectSchema = new Schema<IProject>({
    name: { type: String, required: true },
    description: { type: String },
    website: { type: String },
    githubUrl: { type: String },
    twitterUrl: { type: String },
    contracts: [ContractSchema],
    socialMetrics: { type: SocialMetricsSchema, default: () => ({}) },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better query performance
ProjectSchema.index({ 'contracts.address': 1 });
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ 'socialMetrics.projectFreshness': -1 });

export const Project = model<IProject>('Project', ProjectSchema);

// Example usage:
/*
const blendProject = new Project({
    name: 'Blend',
    description: 'Blend Capital Protocol',
    website: 'https://docs.blend.capital/mainnet-deployments',
    githubUrl: 'https://github.com/blend-capital',
    twitterUrl: 'https://x.com/blend_capital',
    contracts: [
        {
            name: 'Blend USDC-XLM Pool',
            address: 'CDVQVKOY2YSXS2IC7KN6MNASSHPAO7UN2UR2ON4OI2SKMFJNVAMDX6DP',
            type: 'Pool'
        },
        {
            name: 'Blend Backstop Pool',
            address: 'CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3',
            type: 'Pool'
        }
        // ... other contracts
    ]
});
*/ 