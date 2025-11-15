# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start both Keystone CMS and Next.js development servers in parallel
- `npm run build` - Build the complete application (Keystone + Next.js)
- `npm run start` - Start the production server

### Individual Services
- `npm run keystone:dev` - Start only Keystone CMS development server
- `npm run keystone:build` - Build only Keystone CMS (without UI)
- `npm run keystone:start` - Start only Keystone CMS production server
- `npm run next:dev` - Start only Next.js development server
- `npm run next:build` - Build only Next.js
- `npm run next:start` - Start only Next.js production server

### Code Quality
- `npm run lint` - Run Biome linter on specified files
- `npm run format` - Format code with Biome
- `npm run check` - Run Biome check and auto-fix issues
- `npm run type-check` - Run TypeScript type checking

### Content Generation
- `npm run script:docs-desc` - Generate document descriptions
- `npm run script:docs-file` - Generate document file listings
- `npm run script:docs-modified` - Generate last modified timestamps for docs
- `npm run script:generate-search-index` - Generate search index for content

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript
- **Backend/CMS**: Keystone 6 with GraphQL
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS with DaisyUI components
- **Internationalization**: next-intl for multi-language support
- **Content**: MDX files for learning materials
- **Authentication**: NextAuth.js integrated with Keystone

### Application Structure

#### Core Directories
- `app/` - Next.js App Router structure with pages and API routes
- `keystone/` - Keystone CMS configuration and schema definitions
- `mdx/` - Learning content organized by difficulty (beginner, intermediate, advanced)
- `messages/` - Internationalization files (JSON format)
- `scripts/` - Automation scripts for content management and data processing

#### Key Architecture Patterns

**Hybrid Authentication System**: The application uses both NextAuth.js and Keystone authentication:
- `keystone/context.ts` handles session management between both systems
- NextAuth for user sessions, Keystone for admin access control
- User data is synchronized between both authentication systems

**Content Management with MDX**:
- Learning content is stored as MDX files in `mdx/` directory
- Content is processed with `app/utils/load-mdx.ts` using next-mdx-remote
- Supports table of contents generation, syntax highlighting, and custom components
- Automatic file discovery and routing based on content structure

**Keystone Data Models**:
- `User` - User management with admin roles
- `Topik` - TOPIK exam questions with hierarchical structure (parent/child questions)
- `Dict/DictItem` - Vocabulary dictionary system with favorites and multi-language support
- `Article` - Learning content with subtitle support for multimedia content
- `Annotation` - User notes and highlights on articles
- `PushSubscription` - Web push notification management

**Internationalization Architecture**:
- Language detection from URL path, cookies, or Accept-Language headers
- Fallback chain: requested locale → cookie → header → default
- Dynamic message loading from `messages/` directory
- Multi-language support in dictionary items and article content

### Key Components and Utilities

**Content Processing**:
- `app/utils/load-mdx.ts` - MDX compilation with remark/rehype plugins
- `app/utils/list-docs.ts` - Content discovery and listing
- Custom markdown components in `app/components/markdown-render/`

**Language Tools**:
- `app/utils/kr-const.ts` - Korean language constants
- `app/utils/convert-input.ts` - Input conversion utilities
- Language processing tools for romanization, pronunciation, and text analysis

**Authentication & Session Management**:
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `keystone/context.ts` - Keystone context with session handling
- `app/hooks/use-user.ts` - User session management hook

### Content Organization Structure

Learning materials are organized by proficiency levels:
- `beginner/` - Basic Korean (alphabet, pronunciation, basic grammar)
- `intermediate/` - Intermediate concepts and grammar
- `advanced/` - Advanced language patterns and nuances

Each level contains:
- `文字与发音/` - Writing and pronunciation guides
- `语法基础/` - Grammar fundamentals
- `语法形态/` - Grammatical forms and endings
- `单词构成/` - Word formation and vocabulary
- `特殊规则/` - Special rules and exceptions

### Development Workflow

**Content Management**:
1. Add new MDX files to appropriate `mdx/level/` directory
2. Run `npm run script:docs-modified` to update timestamps
3. Use `npm run script:generate-search-index` to update search functionality

**Database Schema Changes**:
1. Modify `keystone/schema.ts` for new data models
2. Run `keystone dev` to apply schema changes
3. Test changes in Keystone Admin UI at `/admin`

**Internationalization Updates**:
1. Update `messages/locale.json` files for new translations
2. Test language switching functionality
3. Update content-specific translations in MDX frontmatter

## Important Notes

- The application serves as a comprehensive Korean learning platform with TOPIK exam preparation
- Content is primarily in MDX format with frontmatter for metadata
- Multi-language support includes Chinese, English, Japanese interfaces
- The system integrates various AI services for content generation and processing
- Push notifications are supported for learning reminders
- All content changes trigger automatic search index updates via lint-staged