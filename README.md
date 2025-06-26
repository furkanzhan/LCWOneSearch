# LCW OneSearch

LCW OneSearch, OpenAI GPT modelleri kullanarak akıllı arama ve sohbet deneyimi sunan modern bir Next.js uygulamasıdır.

## Özellikler

- ✨ **Modern UI**: Tailwind CSS ile ChatGPT benzeri responsive tasarım
- 🤖 **AI Chat**: OpenAI GPT-4o entegrasyonu
- 🌙 **Dark Mode**: Otomatik tema değişimi
- ⚡ **Fast**: Next.js 15 ve App Router
- 📱 **Mobile Friendly**: Mobil uyumlu tasarım
- 🔒 **Type Safe**: TypeScript desteği
- 🔐 **Secure**: Environment variables ile güvenli API key yönetimi

## Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API (gpt-4o)
- **Icons**: Heroicons

## Kurulum

1. Depoyu klonlayın:
```bash
git clone <repository-url>
cd lcw-one-search
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını açın ve OpenAI API key'inizi ekleyin:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

> **Önemli**: OpenAI API key'inizi [OpenAI Platform](https://platform.openai.com/account/api-keys) adresinden alabilirsiniz.

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Güvenlik

### Environment Variables

- **`.env.local`**: Yerel geliştirme için kullanılır ve Git'e commit edilmez
- **`.env.example`**: Projeyi kuracak kişiler için şablon dosyası
- **`.gitignore`**: Tüm `.env*` dosyaları otomatik olarak ignore edilir

### API Key Güvenliği

```javascript
// lib/openai.ts - Güvenli API key kullanımı
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}
```

## Proje Yapısı

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Chat API endpoint
│   ├── globals.css           # Global CSS ve Tailwind
│   ├── layout.tsx           # Ana layout
│   └── page.tsx             # Ana sayfa
├── components/
│   ├── Chat.tsx             # Ana chat bileşeni
│   └── ChatInput.tsx        # Mesaj giriş bileşeni
├── lib/
│   └── openai.ts            # OpenAI entegrasyonu
├── .env.local               # Environment variables (Git'e commit edilmez)
├── .env.example             # Environment variables şablonu
└── public/                  # Statik dosyalar
```

## API Kullanımı

### Chat Endpoint

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Merhaba, nasılsın?"
}
```

**Yanıt:**
```json
{
  "message": "Merhaba! Ben iyiyim, teşekkür ederim. Size nasıl yardımcı olabilirim?"
}
```

### OpenAI Integration

```typescript
import { fetchChatResponse, createUserMessage } from '@/lib/openai';

const messages = [
  createUserMessage('Merhaba!')
];

const response = await fetchChatResponse(messages);
```

## Geliştirme

### Yeni Özellik Ekleme

1. `components/` klasöründe yeni bileşenler oluşturun
2. `lib/` klasöründe yardımcı fonksiyonlar ekleyin
3. Gerekirse `app/api/` altında yeni API route'ları oluşturun

### Styling

Bu proje Tailwind CSS kullanmaktadır. ChatGPT benzeri temiz tasarım:
- Full-height layout
- Centered chat container (max-w-2xl)
- Subtle shadows ve rounded corners
- Mobile-responsive design

## Sorun Giderme

### API Key Hataları

```bash
Error: OPENAI_API_KEY environment variable is not set
```

**Çözüm:** `.env.local` dosyasında API key'inizi doğru tanımladığınızdan emin olun.

### Next.js Build Hataları

```bash
npm run build
```

Build sırasında environment variables eksikse hata alabilirsiniz. Production'da environment variables'ları doğru set ettiğinizden emin olun.

## Deployment

### Vercel

1. GitHub'a push edin
2. Vercel'e import edin
3. Environment variables'ları Vercel dashboard'dan ekleyin:
   - `OPENAI_API_KEY`: OpenAI API key'iniz

### Diğer Platformlar

Environment variables'ları platform ayarlarından ekleyin:
```env
OPENAI_API_KEY=sk-your-actual-api-key
NEXTAUTH_URL=https://your-domain.com
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
