// 标注类型枚举
enum AnnotationType {
	HIGHLIGHT = "highlight", // 高亮
	NOTE = "note", // 笔记
	BOOKMARK = "bookmark", // 书签
}

// 标注实体接口
interface Annotation {
	id: string; // 唯一标识符
	type: AnnotationType; // 标注类型
	bookId: string; // 书籍ID
	chapterId: string; // 章节ID
	content?: string; // 标注内容（如笔记）
	range: {
		start: {
			paragraphIndex: number; // 起始段落索引
			offset: number; // 段落内起始字符偏移
		};
		end: {
			paragraphIndex: number; // 结束段落索引
			offset: number; // 段落内结束字符偏移
		};
	};
	color?: string; // 高亮颜色
	createdAt: Date; // 创建时间
	updatedAt: Date; // 更新时间
	userId: string; // 用户ID
}

// 标注管理类
class AnnotationManager {
	private annotations: Annotation[] = [];

	// 创建标注
	createAnnotation(params: Omit<Annotation, "id" | "createdAt" | "updatedAt">) {
		const newAnnotation: Annotation = {
			...params,
			id: this.generateUniqueId(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		this.annotations.push(newAnnotation);
		return newAnnotation;
	}

	// 获取特定书籍和章节的所有标注
	getAnnotationsForChapter(bookId: string, chapterId: string) {
		return this.annotations.filter(
			(anno) => anno.bookId === bookId && anno.chapterId === chapterId,
		);
	}

	// 更新标注
	updateAnnotation(id: string, updates: Partial<Annotation>) {
		const index = this.annotations.findIndex((anno) => anno.id === id);
		if (index !== -1) {
			this.annotations[index] = {
				...this.annotations[index],
				...updates,
				updatedAt: new Date(),
			};
		}
	}

	// 删除标注
	deleteAnnotation(id: string) {
		this.annotations = this.annotations.filter((anno) => anno.id !== id);
	}

	// 检查是否存在重叠标注
	private checkOverlappingAnnotations(newAnnotation: Annotation) {
		return this.annotations.some((existingAnno) =>
			this.isAnnotationOverlapping(existingAnno, newAnnotation),
		);
	}

	// 判断标注是否重叠的复杂逻辑
	private isAnnotationOverlapping(
		_anno1: Annotation,
		_anno2: Annotation,
	): boolean {
		// 实现复杂的重叠检查逻辑
		// 需要考虑段落索引和字符偏移
		return false; // 占位实现
	}

	// 生成唯一ID
	private generateUniqueId(): string {
		return `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

export { AnnotationManager };
