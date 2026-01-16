# 🎨 Novas Seções do Hub - Código para Implementar

## 📍 Localização

Inserir após a linha 284 (após `</div>` do Mentor Section) e antes da linha 285 (`</div>` que fecha o grid).

## 📝 Código Completo das Novas Seções

```typescript
{/* Welcome Message Section */}
{form.welcomeMessage && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            padding: '40px', 
            borderRadius: '24px', 
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', opacity: 0.1 }}>
            <Sparkles size={150} />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Sparkles size={24} />
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Mensagem do Mentor</div>
            </div>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, fontWeight: 400, margin: 0 }}>{form.welcomeMessage}</p>
        </div>
    </motion.div>
)}

{/* Welcome Video Section */}
{form.welcomeVideo && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #eee' }}
    >
        <div style={{ padding: '30px 30px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={20} color={primaryColor} />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Vídeo de Boas-Vindas</div>
                    <div style={{ fontSize: '0.85rem', color: '#5C5E62' }}>Mensagem especial do mentor</div>
                </div>
            </div>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
                src={form.welcomeVideo.includes('youtube.com') || form.welcomeVideo.includes('youtu.be') 
                    ? form.welcomeVideo.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                    : form.welcomeVideo}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    </motion.div>
)}

{/* Custom Fields Section */}
{form.customFields && form.customFields.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={20} color={primaryColor} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Informações Importantes</div>
        </div>
        <div style={{ display: 'grid', gap: '15px' }}>
            {form.customFields.sort((a, b) => a.order - b.order).map((field, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '12px' }}>
                    <div style={{ background: primaryColor, width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Info size={18} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', color: '#171A20' }}>{field.label}</div>
                        <div style={{ fontSize: '0.85rem', color: '#5C5E62', wordBreak: 'break-word' }}>{field.value}</div>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
)}

{/* Agenda Section */}
{form.agenda && form.agenda.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color={primaryColor} />
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Programação do Evento</div>
                <div style={{ fontSize: '0.85rem', color: '#5C5E62' }}>Agenda completa das atividades</div>
            </div>
        </div>
        <div style={{ position: 'relative', paddingLeft: '30px' }}>
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', background: 'linear-gradient(to bottom, ' + primaryColor + ', rgba(0,0,0,0.1))' }} />
            
            <div style={{ display: 'grid', gap: '20px' }}>
                {form.agenda.sort((a, b) => a.order - b.order).map((item, index) => (
                    <div key={index} style={{ position: 'relative', display: 'flex', gap: '20px' }}>
                        {/* Timeline Dot */}
                        <div style={{ position: 'absolute', left: '-23px', top: '8px', width: '12px', height: '12px', borderRadius: '50%', background: primaryColor, border: '3px solid #fff', boxShadow: '0 0 0 2px ' + primaryColor }} />
                        
                        <div style={{ flex: 1, background: '#f9f9f9', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: primaryColor }}>{item.time}</div>
                                {item.duration && (
                                    <div style={{ fontSize: '0.75rem', background: '#fff', padding: '4px 12px', borderRadius: '100px', fontWeight: 600, color: '#5C5E62' }}>
                                        {item.duration}
                                    </div>
                                )}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px', color: '#171A20' }}>{item.activity}</div>
                            {item.description && (
                                <div style={{ fontSize: '0.85rem', color: '#5C5E62', lineHeight: 1.6 }}>{item.description}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
)}

{/* Materials Section */}
{form.materials && form.materials.length > 0 && (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{ background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #eee' }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <div style={{ background: '#f4f4f4', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color={primaryColor} />
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Materiais do Curso</div>
                <div style={{ fontSize: '0.85rem', color: '#5C5E62' }}>Downloads e recursos</div>
            </div>
        </div>
        <div style={{ display: 'grid', gap: '12px' }}>
            {form.materials.sort((a, b) => a.order - b.order).map((material, index) => {
                const eventPassed = form.eventDate ? new Date(form.eventDate) < new Date() : false;
                const isAvailable = !material.availableAfterEvent || eventPassed;
                
                const getIcon = () => {
                    switch(material.type) {
                        case 'pdf': return <FileText size={18} />;
                        case 'video': return <Play size={18} />;
                        case 'link': return <LinkIcon size={18} />;
                        case 'zip': return <Download size={18} />;
                        default: return <FileText size={18} />;
                    }
                };

                return (
                    <a
                        key={index}
                        href={isAvailable ? material.url : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !isAvailable && e.preventDefault()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '18px',
                            background: isAvailable ? '#f9f9f9' : '#f0f0f0',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            opacity: isAvailable ? 1 : 0.6,
                            transition: 'all 0.3s',
                            border: '1px solid transparent'
                        }}
                        onMouseEnter={(e) => isAvailable && (e.currentTarget.style.background = '#f0f0f0', e.currentTarget.style.borderColor = primaryColor)}
                        onMouseLeave={(e) => isAvailable && (e.currentTarget.style.background = '#f9f9f9', e.currentTarget.style.borderColor = 'transparent')}
                    >
                        <div style={{ background: isAvailable ? primaryColor : '#ccc', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                            {getIcon()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{material.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#5C5E62' }}>
                                {material.size && `${material.size} • `}
                                {material.type.toUpperCase()}
                                {!isAvailable && ' • Disponível após o evento'}
                            </div>
                        </div>
                        {isAvailable && (
                            <Download size={20} color={primaryColor} />
                        )}
                    </a>
                );
            })}
        </div>
    </motion.div>
)}
```

## 🎯 Instruções de Implementação

1. Abra `client/src/app/hub/[id]/page.tsx`
2. Localize a linha 284 (final do Mentor Section)
3. Cole o código acima APÓS a linha 284
4. Salve o arquivo

## ✅ Resultado

O Hub agora terá 5 novas seções premium:

1. **Mensagem de Boas-Vindas** - Gradiente roxo com ícone Sparkles
2. **Vídeo de Boas-Vindas** - Iframe responsivo do YouTube
3. **Campos Customizados** - Cards com informações importantes
4. **Agenda** - Timeline visual com horários
5. **Materiais** - Downloads com controle de disponibilidade

Todas as seções aparecem apenas se tiverem dados configurados!
