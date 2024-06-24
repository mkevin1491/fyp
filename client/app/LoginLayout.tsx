// // components/LoginLayout.tsx
// import React from 'react';
// import { cn } from '@/lib/utils';
// import { Inter } from 'next/font/google';
// import { MaterialTailwindControllerProvider } from "@/components/context";

// const inter = Inter({ subsets: ['latin'] });

// const LoginLayout: React.FC = ({ children }) => {
//     return (
//         <html lang="en" suppressHydrationWarning>
//             <body className={cn('flex min-h-screen bg-gray-100', inter.className)}>
//                 <MaterialTailwindControllerProvider>
//                     {/* Your login layout content here */}
//                     {children}
//                 </MaterialTailwindControllerProvider>
//             </body>
//         </html>
//     );
// };

// export default LoginLayout;
