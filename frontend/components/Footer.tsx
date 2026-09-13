import Link from "next/link";
import { Code2, Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold text-slate-100">CodePath</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Empowering engineering students with an intelligent programming mentor, structured DSA roadmaps, real-world project guides, and placement preparation.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <Link href="https://github.com" target="_blank" className="p-2 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                <Github className="w-4 h-4" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="p-2 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="p-2 rounded-md hover:bg-slate-900 text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Learn</h4>
            <ul className="space-y-2">
              <li><Link href="/learn" className="hover:text-blue-400 transition-colors">Courses</Link></li>
              <li><Link href="/practice" className="hover:text-blue-400 transition-colors">Coding Practice</Link></li>
              <li><Link href="/dsa" className="hover:text-blue-400 transition-colors">DSA Roadmap</Link></li>
              <li><Link href="/error-doctor" className="hover:text-blue-400 transition-colors">Error Doctor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Career</h4>
            <ul className="space-y-2">
              <li><Link href="/career" className="hover:text-blue-400 transition-colors">Roadmaps</Link></li>
              <li><Link href="/projects" className="hover:text-blue-400 transition-colors">Project Mentor</Link></li>
              <li><Link href="/interview" className="hover:text-blue-400 transition-colors">Mock Interviews</Link></li>
              <li><Link href="/placement" className="hover:text-blue-400 transition-colors">Placement Tests</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/resume" className="hover:text-blue-400 transition-colors">ATS Resume Builder</Link></li>
              <li><Link href="/github" className="hover:text-blue-400 transition-colors">GitHub Audit</Link></li>
              <li><Link href="/community" className="hover:text-blue-400 transition-colors">Community Forum</Link></li>
              <li><Link href="/admin" className="hover:text-blue-400 transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} CodePath Inc. Built for engineering students.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted with clean code & pedagogical precision.
          </p>
        </div>
      </div>
    </footer>
  );
}
