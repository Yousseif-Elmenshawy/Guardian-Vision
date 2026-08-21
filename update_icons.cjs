const fs = require('fs');
const path = require('path');

const mappings = {
    "Math": { icon: "Calculator", color: "#3b82f6" },
    "English": { icon: "Globe", color: "#a855f7" },
    "Arabic": { icon: "BookOpen", color: "#10b981" },
    "Physics": { icon: "Atom", color: "#22c55e" },
    "TCS": { icon: "Brain", color: "#6366f1" },
    "CDC": { icon: "Network", color: "#eab308" },
    "Capstone": { icon: "Award", color: "#14b8a6" },
    "Social studies": { icon: "Users", color: "#f97316" },
    "IT": { icon: "BookMarked", color: "#ec4899" },
    "Communication": { icon: "Radio", color: "#06b6d4" },
    "Communications": { icon: "Radio", color: "#06b6d4" },
    "National studies": { icon: "Landmark", color: "#8b5cf6" },
    "Networking": { icon: "Wifi", color: "#ec4899" }
};

const dir = path.join(process.cwd(), 'src/components/Every subject');
for (const [name, data] of Object.entries(mappings)) {
    const filePath = path.join(dir, name + '.jsx');
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Add import
        if (!content.match(new RegExp(`\\\\b${data.icon}\\\\b`))) {
            content = content.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, (match, p1) => {
                return `import {${p1}, ${data.icon} } from 'lucide-react';`;
            });
        }
        
        content = content.replace(/backgroundColor: "#3b82f6"/, `backgroundColor: "${data.color}"`);
        content = content.replace(/<Calculator size=\{32\} color="white" \/>/, `<${data.icon} size={32} color="white" />`);
        
        fs.writeFileSync(filePath, content);
    }
}
console.log("Done updating icons");
