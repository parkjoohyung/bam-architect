
# Backup Instructions

Since the automated agent does not have permission to write outside the project directory, please run the following command in your terminal (`PowerShell` or `cmd`) to back up the current state of the project:

```powershell
robocopy d:\park\05.web d:\park\05.web_backup_20260206 /E /MT:8 /R:3 /W:3 /NFL /NDL /XD node_modules .git
```

**Explanation of flags:**
- `/E`: Copy subdirectories, including empty ones.
- `/MT:8`: Multi-threaded copy (faster).
- `/R:3 /W:3`: Retry 3 times, wait 3 seconds on failure (good for locked files).
- `/NFL /NDL`: No File List, No Directory List (reduces output noise).
- `/XD node_modules .git`: Excludes heavy/hidden folders. Remove this part if you want a 100% full backup.
