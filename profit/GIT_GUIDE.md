# Hướng dẫn đẩy code lên GitHub an toàn (ProFit)

> Repo: https://github.com/ThaiTu-cmd/ProFit.git  
> Branch chính: `develop`

## 1. Lỗi thường gặp & cách fix

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `SSL certificate ... unable to get local issuer certificate` | Git đang dùng `openssl` mà thiếu CA cert | Đã fix 1 lần ở repo này (chuyển sang `schannel`) |
| `Updates were rejected because the remote contains work that you do not have locally` | Remote có commit mà local chưa có (do người khác push, hoặc revert trên GitHub) | Dùng `safe-push.ps1` để script tự xử lý |

## 2. Quy trình chuẩn (khuyến nghị)

**Bước 1.** Code xong, kiểm tra thay đổi:
```powershell
git status
git diff
```

**Bước 2.** Chạy script an toàn (tự `add → commit → pull --rebase → push`):
```powershell
.\safe-push.ps1
```

Script sẽ hỏi commit message nếu bạn chưa nhập.  
Nếu push bị reject, script sẽ hỏi có muốn `force-with-lease` không — chỉ chọn `yes` khi chắc chắn remote không có code mới quan trọng.

## 3. Quy trình thủ công (khi không dùng script)

```powershell
git add .
git commit -m "mo ta thay doi"
git pull --rebase origin develop
git push origin develop
```

Nếu push bị reject mà bạn **chắc chắn** local là bản đúng (giống trường hợp vừa rồi):
```powershell
git push --force-with-lease origin develop
```

> `--force-with-lease` an toàn hơn `--force` vì nó sẽ từ chối ghi đè nếu remote có commit mới mà bạn chưa thấy.

## 4. Sau khi push xong — verify

- Mở https://github.com/ThaiTu-cmd/ProFit/tree/develop
- Tìm commit mới nhất trong danh sách file
- Nếu đang chạy backend/frontend local, **pull về** rồi restart:
  ```powershell
  git pull origin develop
  ```

## 5. Khi muốn code remote giống 100% local (force overwrite)

Cảnh báo: **Lệnh này XÓA HẾT commit trên remote và thay bằng local.**  
Chỉ dùng khi chắc chắn không ai đang push code mới lên branch đó.

```powershell
git push --force-with-lease origin develop
```

Nếu vẫn bị reject (vì remote có commit bạn chưa thấy):
```powershell
git push --force origin develop
```

> Dùng `--force` thuần thì xóa cả những commit bạn chưa pull về.  
> Ưu tiên `--force-with-lease` luôn.

## 6. Lưu ý quan trọng

- **Không commit file `.env`** (chứa DB password, secret) — đã có trong `.gitignore`.
- **Không commit `node_modules/`, `target/`** — đã ignore sẵn.
- Nếu thấy file lạ trong `git status`, **đừng `git add .`** mà hãy xem lại trước.
