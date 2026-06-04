# Contributing to Auth-Pro

First off, thank you for considering contributing to Auth-Pro! It's people like you that make Auth-Pro a great tool. We welcome all kinds of contributions, whether it's fixing bugs, improving documentation, adding new features, or submitting suggestions.

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Code of Conduct

By participating in this project, you agree to abide by the standard open-source community conventions. We expect all contributors to:
- Be respectful and welcoming.
- Keep criticisms constructive.
- Focus on what is best for the community.

## How Can I Contribute?

### Reporting Bugs
If you find a bug in the source code, you can help us by submitting an issue to our GitHub Repository. Before creating a bug report, please check existing issues as you might find out that you don't need to create one.

### Suggesting Enhancements
If you want to suggest an enhancement, please submit an issue explaining your idea. Provide as much context as possible, including why you think it would be a good addition and how it should work.

### Pull Requests
Good pull requests—patches, improvements, new features—are a fantastic help. They should remain focused in scope and avoid containing unrelated commits.

Follow this process to contribute:
1. **Fork the repository** on GitHub.
2. **Clone your fork** locally: `git clone https://github.com/YOUR-USERNAME/AUTH-PRO.git`
3. **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name`
4. **Make your changes** and test them locally.
5. **Commit your changes** with descriptive commit messages.
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Submit a Pull Request** against the `main` branch of the original repository.

## Development Setup

If you want to work on the codebase locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   Fill in your `.env` with a database URL, SMTP configuration, and Cloudflare R2 credentials if you intend to test all features manually.
   
3. Run the application in development mode:
   ```bash
   npm run start:dev
   ```

## Development Guidelines

### Code Style
- We use **NestJS conventions**. Modules should be kept focused and strictly separated (Domain-Driven).
- We use **Prettier** for code formatting and **ESLint** for linting. Please ensure your code conforms by running:
  ```bash
  npm run lint
  npm run format
  ```
- Use TypeScript strictly. Avoid using `any`; use specific interfaces or `unknown` where types are truly ambiguous.

### Testing
We enforce a strict testing policy to ensure stability:
- Any new features must be accompanied by relevant **Unit Tests**.
- If adding or changing an HTTP API endpoint, you must update the **E2E Tests** (`test/app.e2e-spec.ts`).
- Auth-Pro uses a 100% mocked environment for tests, meaning tests should **never** require real database connections, cloud storage, or SMTP servers. 
- Before submitting a pull request, ensure all tests pass:
  ```bash
  npm test          # Unit tests
  npm run test:e2e  # E2E tests
  ```

### Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
Example formats:
- `feat: add new password rotation policy`
- `fix: resolve crash on missing avatar buffer`
- `docs: update contributing guide`

## Review Process
Once you open a Pull Request, the maintainers will review your code. We might ask for some changes before merging, or suggest a different approach. Please be responsive, and we will get your code merged as soon as possible!

Thank you for contributing! 🚀
