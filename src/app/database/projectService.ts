import { PrismaClient } from '@prisma/client';
import { GitHubService, GitHubRepoData } from '../services/githubService';

interface ProjectData {
    name: string;
    description?: string;
    website?: string;
    githubUrl?: string;
    twitterUrl?: string;
    contracts: Array<{
        name: string;
        address: string;
        type: string;
    }>;
}

interface SocialMetricsData {
    githubStars?: number;
    githubForks?: number;
    githubLastUpdate?: Date;
    twitterFollowers?: number;
    twitterLastUpdate?: Date;
}

export class ProjectService {
    private prisma: PrismaClient;
    private githubService: GitHubService;

    constructor() {
        this.prisma = new PrismaClient();
        this.githubService = new GitHubService();
    }

    async createProject(projectData: ProjectData) {
        return this.prisma.project.create({
            data: {
                name: projectData.name,
                description: projectData.description,
                website: projectData.website,
                githubUrl: projectData.githubUrl,
                twitterUrl: projectData.twitterUrl,
                contracts: {
                    create: projectData.contracts
                },
                socialMetrics: {
                    create: {}
                }
            },
            include: {
                contracts: true,
                socialMetrics: true
            }
        });
    }

    async updateContractInteractions(contractAddress: string) {
        const contract = await this.prisma.contract.update({
            where: { address: contractAddress },
            data: {
                interactions: { increment: 1 },
                lastInteraction: new Date()
            },
            include: {
                project: {
                    include: {
                        socialMetrics: true
                    }
                }
            }
        });
        return contract.project;
    }

    async updateSocialMetrics(projectName: string, metrics: SocialMetricsData) {
        const project = await this.prisma.project.findUnique({
            where: { name: projectName },
            include: { socialMetrics: true }
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // If GitHub URL is available, fetch latest GitHub data
        let githubData: GitHubRepoData | null = null;
        if (project.githubUrl) {
            githubData = await this.githubService.getRepoData(project.githubUrl);
        }

        const freshness = this.calculateProjectFreshness({
            ...metrics,
            githubStars: githubData?.stars || metrics.githubStars,
            githubForks: githubData?.forks || metrics.githubForks,
            githubLastUpdate: githubData?.lastCommitDate || metrics.githubLastUpdate,
            commitCount: githubData?.commitCount
        });

        return this.prisma.socialMetrics.update({
            where: {
                projectId: project.id
            },
            data: {
                githubStars: githubData?.stars || metrics.githubStars,
                githubForks: githubData?.forks || metrics.githubForks,
                githubLastUpdate: githubData?.lastCommitDate || metrics.githubLastUpdate,
                twitterFollowers: metrics.twitterFollowers,
                twitterLastUpdate: metrics.twitterLastUpdate,
                projectFreshness: freshness
            },
            include: {
                project: {
                    include: {
                        contracts: true
                    }
                }
            }
        });
    }

    private calculateProjectFreshness(data: SocialMetricsData & { commitCount?: number }): number {
        const now = new Date();
        let freshness = 0;

        // GitHub metrics (70% of total score)
        if (data.githubLastUpdate) {
            const daysSinceLastUpdate = (now.getTime() - new Date(data.githubLastUpdate).getTime()) / (1000 * 60 * 60 * 24);
            const recencyScore = Math.max(0, 1 - (daysSinceLastUpdate / 30)); // Decay over 30 days
            
            const starsScore = Math.min(1, (data.githubStars || 0) / 1000); // Cap at 1000 stars
            const forksScore = Math.min(1, (data.githubForks || 0) / 500); // Cap at 500 forks
            const commitScore = Math.min(1, (data.commitCount || 0) / 1000); // Cap at 1000 commits

            freshness += (recencyScore * 0.4 + starsScore * 0.2 + forksScore * 0.2 + commitScore * 0.2) * 0.7;
        }

        // Twitter metrics (30% of total score)
        if (data.twitterLastUpdate) {
            const daysSinceLastTweet = (now.getTime() - new Date(data.twitterLastUpdate).getTime()) / (1000 * 60 * 60 * 24);
            const twitterRecencyScore = Math.max(0, 1 - (daysSinceLastTweet / 7)); // Decay over 7 days
            
            const followersScore = Math.min(1, (data.twitterFollowers || 0) / 10000); // Cap at 10000 followers

            freshness += (twitterRecencyScore * 0.7 + followersScore * 0.3) * 0.3;
        }

        return Math.min(1, freshness); // Normalize to 0-1
    }

    async getProjectByContractAddress(contractAddress: string) {
        return this.prisma.project.findFirst({
            where: {
                contracts: {
                    some: {
                        address: contractAddress
                    }
                }
            },
            include: {
                contracts: true,
                socialMetrics: true
            }
        });
    }

    async getTopProjects(limit: number = 10) {
        return this.prisma.project.findMany({
            orderBy: {
                socialMetrics: {
                    projectFreshness: 'desc'
                }
            },
            take: limit,
            include: {
                contracts: true,
                socialMetrics: true
            }
        });
    }
} 