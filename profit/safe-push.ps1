# =====================================================
# safe-push.ps1 - Git helper an toan cho repo ProFit
# =====================================================
# SU DUNG:
#   1. Commit code nhu binh thuong:  git add . ; git commit -m "..."
#   2. Truoc khi push, chay script nay:  .\safe-push.ps1
#   3. Script se tu dong: pull --rebase + push
#      Neu push bi reject (remote co commit moi), script se canh bao
#      va huong dan fix.
#
# TAI SAO CAN SCRIPT NAY?
#   - Tranh loi "Updates were rejected because the remote contains work..."
#   - Tu dong rebase giu lich su commit sach
#   - Khong tu dong --force (tranh mat code ngoai y muon)
# =====================================================

param(
    [string]$Branch = "develop",
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== safe-push.ps1 ===" -ForegroundColor Cyan
Write-Host "Branch hien tai: $Branch" -ForegroundColor Gray
Write-Host ""

# 1. Kiem tra dang o trong git repo chua
$gitRoot = git rev-parse --show-toplevel 2>$null
if (-not $gitRoot) {
    Write-Host "[LOI] Thu muc hien tai khong phai git repo." -ForegroundColor Red
    exit 1
}

# 2. Lay trang thai git
$status = git status --porcelain
$hasUncommittedChanges = $status.Length -gt 0

# 3. Neu co thay doi chua commit
if ($hasUncommittedChanges) {
    Write-Host "[1/4] Co thay doi chua commit. Dang commit..." -ForegroundColor Yellow
    git add -A

    if ([string]::IsNullOrWhiteSpace($Message)) {
        $Message = Read-Host "Nhap commit message"
    }
    if ([string]::IsNullOrWhiteSpace($Message)) {
        Write-Host "[LOI] Commit message khong duoc de trong." -ForegroundColor Red
        exit 1
    }
    git commit -m $Message
} else {
    Write-Host "[1/4] Khong co thay doi chua commit." -ForegroundColor Green
}

# 4. Pull --rebase de dong bo voi remote
Write-Host ""
Write-Host "[2/4] Pull --rebase tu origin/$Branch ..." -ForegroundColor Yellow
git pull --rebase origin $Branch
if ($LASTEXITCODE -ne 0) {
    Write-Host "[LOI] Pull that bai. Co the do xung dot. Giai quyet xong chay lai script." -ForegroundColor Red
    exit 1
}

# 5. Push
Write-Host ""
Write-Host "[3/4] Push len origin/$Branch ..." -ForegroundColor Yellow
git push origin $Branch
$pushOk = $LASTEXITCODE -eq 0

if (-not $pushOk) {
    Write-Host ""
    Write-Host "[CANH BAO] Push bi reject! Remote co commit moi chua co trong local." -ForegroundColor Red
    Write-Host ""
    $answer = Read-Host "Ban co muon FORCE PUSH (ghi de remote)? (yes/no)"
    if ($answer -eq "yes") {
        Write-Host "[3/4] Force push (--force-with-lease) ..." -ForegroundColor Yellow
        git push --force-with-lease origin $Branch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[LOI] Force push that bai." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Da dung. Hay pull --rebase thu cong roi push lai." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "[4/4] Xong!" -ForegroundColor Green
Write-Host "Code da duoc day len origin/$Branch thanh cong." -ForegroundColor Green
Write-Host ""
