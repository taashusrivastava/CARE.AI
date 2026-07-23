import pathlib
p = pathlib.Path('src/pages/Landing.jsx')
c = p.read_text('utf-8')

# Fix 1: Missing </div> in quick action cards map (line ~69)
c = c.replace(
    '                <div className="text-xs text-slate-500">{d}</div>\n            ))}',
    '                <div className="text-xs text-slate-500">{d}</div>\n              </div>\n            ))}'
)

# Fix 2: Missing </div> for w-64 h-64 div (the avatar circle inner divs)
c = c.replace(
    '                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: \'0.3s\'}}></span>\n                  </div>\n              </div>',
    '                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: \'0.3s\'}}></span>\n                  </div>\n                </div>\n              </div>'
)

# Fix 3: Missing </div> for the relative aspect-square div and lg:col-span-5
c = c.replace(
    '              <span className="text-xs font-semibold text-slate-700">Not a substitute for professional care</span>\n            </div>\n        </div>\n      </section>',
    '              <span className="text-xs font-semibold text-slate-700">Not a substitute for professional care</span>\n            </div>\n          </div>\n        </div>\n      </section>'
)

# Fix 4: Missing </div> in stats map
c = c.replace(
    '              <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>\n          ))}',
    '              <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>\n            </div>\n          ))}'
)

# Fix 5: Missing </div> in features map
c = c.replace(
    '                Learn more <ArrowRight className="w-3 h-3" />\n              </div>\n          ))}',
    '                Learn more <ArrowRight className="w-3 h-3" />\n              </div>\n            </div>\n          ))}'
)

# Fix 6: Missing </div> in CTA relative div
c = c.replace(
    '              </Link>\n            </div>\n        </div>\n      </section>',
    '              </Link>\n            </div>\n          </div>\n        </div>\n      </section>'
)

# Fix 7: Missing </div> in footer inner div
c = c.replace(
    '            <span>Always consult a professional</span>\n          </div>\n      </footer>',
    '            <span>Always consult a professional</span>\n          </div>\n        </div>\n      </footer>'
)

# Count tags to verify
open_div = c.count('<div')
close_div = c.count('</div>')
open_sec = c.count('<section')
close_sec = c.count('</section>')
open_footer = c.count('<footer')
close_footer = c.count('</footer>')

print(f"Before fix: <div>: {open_div}, </div>: {close_div}, balanced: {open_div == close_div}")
print(f"<section>: {open_sec}, </section>: {close_sec}, balanced: {open_sec == close_sec}")
print(f"<footer>: {open_footer}, </footer>: {close_footer}, balanced: {open_footer == close_footer}")

p.write_text(c, 'utf-8')
print("File written successfully!")

# Re-count
c2 = p.read_text('utf-8')
print(f"After fix: <div>: {c2.count('<div')}, </div>: {c2.count('</div>')}, balanced: {c2.count('<div') == c2.count('</div>')}")
