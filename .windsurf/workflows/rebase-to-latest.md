---
description: main 分支有更新后，rebase 到 develop 分支
---

1. 确保本地仓库是最新的
   ```bash
   git fetch origin
   ```

2. 切换到 develop 分支
   ```bash
   git checkout develop
   ```

3. 确保 develop 分支是最新的
   ```bash
   git pull origin develop
   ```

4. 进行 rebase 操作，将 main 分支的最新提交变基到 develop
   ```bash
   git rebase origin/main
   ```

5. 解决冲突（如有），解决后继续 rebase
   ```bash
   git add .
   git rebase --continue
   ```

6. rebase 完成后，将 develop 分支推送到远程（如有权限）
   ```bash
   git push origin develop
   ```

7. 如果推送失败（因为远程 develop 有新提交），需要先 pull --rebase，再 push
   ```bash
   git pull --rebase origin develop
   git push origin develop
   ```
