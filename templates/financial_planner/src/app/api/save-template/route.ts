import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'web-templates');

export async function POST(request: NextRequest) {
  try {
    const { projectName, pages, action } = await request.json();

    if (!projectName || !pages || typeof pages !== 'object') {
      return NextResponse.json(
        { error: 'Missing projectName or pages' },
        { status: 400 }
      );
    }

    // Sanitize project name for filesystem
    const safeName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (!safeName) {
      return NextResponse.json(
        { error: 'Invalid project name' },
        { status: 400 }
      );
    }

    const projectDir = path.join(TEMPLATES_DIR, safeName);

    if (action === 'delete') {
      // Delete the project directory
      try {
        await fs.rm(projectDir, { recursive: true, force: true });
      } catch {}
      return NextResponse.json({ success: true, action: 'deleted', path: projectDir });
    }

    // Create the project directory
    await fs.mkdir(projectDir, { recursive: true });

    // Write each page as an HTML file
    const savedFiles: string[] = [];
    for (const [pageName, htmlContent] of Object.entries(pages)) {
      if (typeof htmlContent !== 'string') continue;

      const slug = pageName.toLowerCase().replace(/\s+/g, '-');
      const fileName = `${slug}.html`;
      const filePath = path.join(projectDir, fileName);

      await fs.writeFile(filePath, htmlContent, 'utf-8');
      savedFiles.push(fileName);
    }

    // Write an index.html that redirects to home if it doesn't exist
    const homeFile = path.join(projectDir, 'home.html');
    const indexFile = path.join(projectDir, 'index.html');
    try {
      await fs.access(homeFile);
      // Copy home.html to index.html if index doesn't exist
      try {
        await fs.access(indexFile);
      } catch {
        const homeContent = await fs.readFile(homeFile, 'utf-8');
        await fs.writeFile(indexFile, homeContent, 'utf-8');
        savedFiles.push('index.html');
      }
    } catch {
      // No home.html, check if index.html already exists
      try {
        await fs.access(indexFile);
      } catch {
        // Write a simple redirect index.html
        const firstPage = Object.keys(pages)[0];
        const firstSlug = firstPage?.toLowerCase().replace(/\s+/g, '-') || 'home';
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${firstSlug}.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="${firstSlug}.html">${firstSlug}</a>...</p>
</body>
</html>`;
        await fs.writeFile(indexFile, redirectHtml, 'utf-8');
        savedFiles.push('index.html');
      }
    }

    // Write a manifest.json with metadata
    const manifest = {
      name: projectName,
      pages: Object.keys(pages),
      files: savedFiles,
      createdAt: new Date().toISOString(),
    };
    await fs.writeFile(
      path.join(projectDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    savedFiles.push('manifest.json');

    return NextResponse.json({
      success: true,
      action: 'saved',
      path: projectDir,
      files: savedFiles,
    });
  } catch (error: any) {
    console.error('[save-template] Error:', error);
    return NextResponse.json(
      { error: `Failed to save template: ${error.message}` },
      { status: 500 }
    );
  }
}
