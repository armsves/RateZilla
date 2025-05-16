import { Octokit } from '@octokit/rest';

export interface GitHubRepoData {
    stars: number;
    forks: number;
    lastCommitDate: Date;
    commitCount: number;
}

export class GitHubService {
    private octokit: Octokit;

    constructor(token?: string) {
        this.octokit = new Octokit({
            auth: token || process.env.GITHUB_TOKEN,
        });
    }

    private extractOwnerAndRepo(githubUrl: string): { owner: string; repo: string } | null {
        try {
            const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) return null;
            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, ''),
            };
        } catch (error) {
            console.error('Error parsing GitHub URL:', error);
            return null;
        }
    }

    async getRepoData(githubUrl: string): Promise<GitHubRepoData | null> {
        const repoInfo = this.extractOwnerAndRepo(githubUrl);
        if (!repoInfo) return null;

        try {
            // Get repository data
            const { data: repo } = await this.octokit.repos.get({
                owner: repoInfo.owner,
                repo: repoInfo.repo,
            });

            // Get latest commits
            const { data: commits } = await this.octokit.repos.listCommits({
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                per_page: 1,
            });

            return {
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                lastCommitDate: new Date(commits[0]?.commit.author?.date || repo.updated_at),
                commitCount: repo.default_branch ? await this.getCommitCount(repoInfo.owner, repoInfo.repo) : 0,
            };
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            return null;
        }
    }

    private async getCommitCount(owner: string, repo: string): Promise<number> {
        try {
            const { data: commits } = await this.octokit.repos.listCommits({
                owner,
                repo,
                per_page: 1,
            });

            if (commits.length === 0) return 0;

            // Get the total count from the Link header
            const response = await this.octokit.request('HEAD /repos/{owner}/{repo}/commits', {
                owner,
                repo,
            });

            const linkHeader = response.headers.link;
            if (!linkHeader) return 1;

            const match = linkHeader.match(/page=(\d+)>; rel="last"/);
            return match ? parseInt(match[1], 10) : 1;
        } catch (error) {
            console.error('Error getting commit count:', error);
            return 0;
        }
    }
} 