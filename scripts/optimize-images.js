#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Optimizes and reorganizes image assets for the new Next.js structure:
 * - Converts images to modern formats (WebP, AVIF)
 * - Generates multiple sizes for responsive images
 * - Optimizes file sizes while maintaining quality
 * - Organizes images by content type
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class ImageOptimizer {
  constructor() {
    this.sourceDir = 'public/images';
    this.targetDir = 'public/images';
    this.optimizationLog = [];

    // Image optimization settings
    this.settings = {
      quality: 85,
      progressive: true,
      sizes: [400, 800, 1200, 1600], // Responsive sizes
      formats: ['webp', 'jpg'], // Output formats
      maxWidth: 1920,
      maxHeight: 1080,
    };
  }

  async optimize() {
    console.log('🖼️ Starting image optimization...\n');

    try {
      await this.createDirectoryStructure();
      await this.optimizeAllImages();
      await this.generateOptimizationReport();

      console.log('✅ Image optimization completed successfully!');
      console.log('📄 Check image-optimization-report.json for details');
    } catch (error) {
      console.error('❌ Image optimization failed:', error.message);
      throw error;
    }
  }

  async createDirectoryStructure() {
    console.log('📁 Creating optimized directory structure...');

    const directories = [
      'public/images/blog',
      'public/images/portfolio',
      'public/images/reviews',
      'public/images/optimized/blog',
      'public/images/optimized/portfolio',
      'public/images/optimized/reviews',
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    console.log('✅ Directory structure created\n');
  }

  async optimizeAllImages() {
    console.log('🔄 Processing images...');

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
    const images = await this.findImages(this.sourceDir, imageExtensions);

    console.log(`Found ${images.length} images to process`);

    let processedCount = 0;

    for (const imagePath of images) {
      try {
        await this.processImage(imagePath);
        processedCount++;

        if (processedCount % 10 === 0) {
          console.log(`Processed ${processedCount}/${images.length} images...`);
        }
      } catch (error) {
        this.logError(imagePath, error.message);
      }
    }

    console.log(`✅ Processed ${processedCount} images\n`);
  }

  async processImage(imagePath) {
    const relativePath = path.relative(this.sourceDir, imagePath);
    const parsedPath = path.parse(relativePath);
    const contentType = this.getContentType(relativePath);

    // Get original image info
    const originalStats = await fs.stat(imagePath);
    const originalSize = originalStats.size;

    // Load image with Sharp
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Skip if image is too small or already optimized
    if (metadata.width < 200 || metadata.height < 200) {
      this.logSkip(relativePath, 'Image too small');
      return;
    }

    if (originalSize < 50000) {
      // Less than 50KB
      this.logSkip(relativePath, 'Image already small enough');
      return;
    }

    // Generate optimized versions
    const optimizedVersions = [];

    for (const format of this.settings.formats) {
      for (const size of this.settings.sizes) {
        // Skip if size is larger than original
        if (size > metadata.width) continue;

        const optimizedPath = this.getOptimizedPath(
          relativePath,
          contentType,
          format,
          size
        );

        try {
          await this.generateOptimizedImage(
            imagePath,
            optimizedPath,
            format,
            size
          );

          const optimizedStats = await fs.stat(optimizedPath);
          const optimizedSize = optimizedStats.size;

          optimizedVersions.push({
            path: optimizedPath,
            format,
            size,
            fileSize: optimizedSize,
          });
        } catch (error) {
          this.logError(
            `${relativePath} (${format}, ${size}px)`,
            error.message
          );
        }
      }
    }

    // Log optimization results
    if (optimizedVersions.length > 0) {
      const totalOptimizedSize = optimizedVersions.reduce(
        (sum, v) => sum + v.fileSize,
        0
      );
      const savings = (
        ((originalSize - totalOptimizedSize / optimizedVersions.length) /
          originalSize) *
        100
      ).toFixed(1);

      this.logSuccess(relativePath, {
        originalSize,
        optimizedVersions: optimizedVersions.length,
        averageSavings: savings,
        formats: [...new Set(optimizedVersions.map(v => v.format))],
        sizes: [...new Set(optimizedVersions.map(v => v.size))],
      });
    }
  }

  async generateOptimizedImage(sourcePath, targetPath, format, width) {
    // Ensure target directory exists
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    let pipeline = sharp(sourcePath).resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({
          quality: this.settings.quality,
          effort: 6,
        });
        break;
      case 'avif':
        pipeline = pipeline.avif({
          quality: this.settings.quality,
          effort: 4,
        });
        break;
      case 'jpg':
      case 'jpeg':
        pipeline = pipeline.jpeg({
          quality: this.settings.quality,
          progressive: this.settings.progressive,
          mozjpeg: true,
        });
        break;
      case 'png':
        pipeline = pipeline.png({
          quality: this.settings.quality,
          progressive: this.settings.progressive,
          compressionLevel: 9,
        });
        break;
    }

    await pipeline.toFile(targetPath);
  }

  getOptimizedPath(relativePath, contentType, format, size) {
    const parsedPath = path.parse(relativePath);
    const filename = `${parsedPath.name}-${size}w.${format}`;

    return path.join(
      'public/images/optimized',
      contentType,
      parsedPath.dir.replace(/^[^/]+\//, ''), // Remove first directory level
      filename
    );
  }

  getContentType(relativePath) {
    if (relativePath.includes('blog')) return 'blog';
    if (relativePath.includes('portfolio')) return 'portfolio';
    if (relativePath.includes('reviews')) return 'reviews';
    return 'general';
  }

  async generateImageManifest() {
    console.log('📋 Generating image manifest...');

    const manifest = {
      timestamp: new Date().toISOString(),
      images: {},
      settings: this.settings,
    };

    // Scan optimized images directory
    const optimizedDir = 'public/images/optimized';
    const optimizedImages = await this.findImages(optimizedDir, [
      '.jpg',
      '.webp',
      '.avif',
    ]);

    for (const imagePath of optimizedImages) {
      const relativePath = path.relative(optimizedDir, imagePath);
      const parsedPath = path.parse(relativePath);

      // Extract info from filename
      const match = parsedPath.name.match(/^(.+)-(\d+)w$/);
      if (match) {
        const [, baseName, width] = match;
        const originalName = `${baseName}${parsedPath.ext}`;
        const contentType = this.getContentType(relativePath);

        if (!manifest.images[originalName]) {
          manifest.images[originalName] = {
            contentType,
            variants: [],
          };
        }

        manifest.images[originalName].variants.push({
          path: `/images/optimized/${relativePath}`,
          format: parsedPath.ext.slice(1),
          width: parseInt(width),
          size: (await fs.stat(imagePath)).size,
        });
      }
    }

    await fs.writeFile(
      'public/images/image-manifest.json',
      JSON.stringify(manifest, null, 2)
    );
    console.log('✅ Image manifest generated\n');
  }

  async generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      settings: this.settings,
      summary: {
        total: this.optimizationLog.length,
        successful: this.optimizationLog.filter(log => log.status === 'success')
          .length,
        skipped: this.optimizationLog.filter(log => log.status === 'skipped')
          .length,
        failed: this.optimizationLog.filter(log => log.status === 'error')
          .length,
      },
      logs: this.optimizationLog,
    };

    await fs.writeFile(
      'image-optimization-report.json',
      JSON.stringify(report, null, 2)
    );
    await this.generateImageManifest();
  }

  // Utility methods
  async findImages(dir, extensions) {
    const images = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subImages = await this.findImages(fullPath, extensions);
          images.push(...subImages);
        } else if (
          extensions.includes(path.extname(entry.name).toLowerCase())
        ) {
          images.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return images;
  }

  logSuccess(imagePath, details) {
    this.optimizationLog.push({
      status: 'success',
      file: imagePath,
      message: `Optimized: ${details.optimizedVersions} versions, avg ${details.averageSavings}% savings`,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  logSkip(imagePath, reason) {
    this.optimizationLog.push({
      status: 'skipped',
      file: imagePath,
      message: reason,
      timestamp: new Date().toISOString(),
    });
  }

  logError(imagePath, error) {
    this.optimizationLog.push({
      status: 'error',
      file: imagePath,
      message: error,
      timestamp: new Date().toISOString(),
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new ImageOptimizer();

  optimizer.optimize().catch(error => {
    console.error('Image optimization failed:', error);
    process.exit(1);
  });
}

module.exports = ImageOptimizer;
