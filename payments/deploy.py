"""Run from the extracted trusted source on Sprinthost; preserves private config."""
from pathlib import Path
import shutil, subprocess, datetime, os

home = Path('/home/davidovd')
source = Path(__file__).resolve().parent
private = home / 'course-payments'
web = home / 'domains/xn--h1acejlsg2a1bo.xn--p1ai/public_html'
assert web.is_dir() and str(source).startswith(str(home) + '/')
stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
backup = home / ('payment-backup-' + stamp)
backup.mkdir(mode=0o700)
if private.exists(): shutil.copytree(private, backup/'private')
private.mkdir(mode=0o700, exist_ok=True)
os.chmod(private, 0o700)
for name in ['lib.php','worker.php','test.php','README.md','config.example.php']:
    shutil.copy2(source/name, private/name)
shutil.copytree(source/'vendor', private/'vendor', dirs_exist_ok=True)
if not (private/'config.php').exists():
    shutil.copy2(source/'config.example.php', private/'config.php')
    text = (private/'config.php').read_text()
    (private/'config.php').write_text(text.replace("'shop_id' => ''", "'shop_id' => '1535303'"))
for path in private.rglob('*'):
    os.chmod(path, 0o700 if path.is_dir() else 0o600)
php = shutil.which('php')
for path in list(private.rglob('*.php')) + list((source/'public').glob('*.php')):
    subprocess.run([php, '-l', str(path)], check=True, stdout=subprocess.DEVNULL)
subprocess.run([php, str(private/'test.php')], check=True)
(web/'api').mkdir(exist_ok=True)
for name, dest in [('checkout.php', web/'checkout.php'), ('payment.php', web/'api/payment.php')]:
    if dest.exists(): shutil.copy2(dest, backup/name)
    shutil.copy2(source/'public'/name, dest)
    os.chmod(dest, 0o644)
previous = subprocess.run(['crontab','-l'], capture_output=True, text=True)
if previous.returncode not in (0,1): raise RuntimeError('Cannot read crontab')
cron = previous.stdout
(backup/'crontab.txt').write_text(cron)
command = php + ' ' + str(private/'worker.php')
if command not in cron:
    cron = cron.rstrip() + '\n* * * * * ' + command + ' >/dev/null 2>&1 # course-test-payments\n'
    subprocess.run(['crontab','-'], input=cron, text=True, check=True)
subprocess.run([php, str(private/'worker.php')], check=True)
print('Installed TEST-ONLY payments; credentials disabled. Backup:', backup)
