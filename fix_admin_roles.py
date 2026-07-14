import os
import re

api_dir = '/Users/sachinsingh070/Desktop/TransitOps/pages/api'

for root, dirs, files in os.walk(api_dir):
    for file in files:
        if file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            original_content = content
            
            def replacer_includes(m):
                arr_content = m.group(1)
                if "'ADMIN'" not in arr_content:
                    return f"![{arr_content}, 'ADMIN'].includes(user.role)"
                return m.group(0)
            
            content = re.sub(r"!\s*\[(.*?)\]\.includes\(user\.role\)", replacer_includes, content)
            
            def replacer_neq(m):
                role = m.group(1)
                if role == 'ADMIN': return m.group(0)
                return f"user.role !== '{role}' && user.role !== 'ADMIN'"
            
            content = re.sub(r"user\.role\s*!==\s*'([^']+)'(?!\s*&&\s*user\.role\s*!==\s*'ADMIN')", replacer_neq, content)

            def replacer_pos_includes(m):
                arr_content = m.group(1)
                if "'ADMIN'" not in arr_content:
                    return f"[{arr_content}, 'ADMIN'].includes(user.role)"
                return m.group(0)

            content = re.sub(r"(?<!!)\[(.*?)\]\.includes\(user\.role\)", replacer_pos_includes, content)

            if content != original_content:
                with open(path, 'w') as f:
                    f.write(content)
                print(f"Updated {path}")
