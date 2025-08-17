"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { Newspaper, Video, Users, Mail, Bell } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="container py-12 text-center">Carregando perfil...</div>;
  }

  if (!session) {
    // Or redirect to login
    notFound();
  }

  const user = session.user;
  // @ts-ignore
  const role = user?.role;

  const renderTabsByRole = () => {
    switch (role) {
      case 'ATHLETE':
      case 'GUARDIAN':
        return (
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Vídeos Postados</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Funcionalidade de métricas de vídeo em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        );
      case 'PRESS':
        return (
          <TabsContent value="articles">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Artigos Publicados</CardTitle>
                <Button><Newspaper className="mr-2 h-4 w-4" /> Novo Artigo</Button>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Listagem de artigos publicados em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        );
      case 'AGENT':
        return (
          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <CardTitle>Atletas de Interesse</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                <p>Funcionalidade de atletas de interesse em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-12">
      <header className="flex flex-col items-center text-center mb-12">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="text-3xl">{user?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold">{user?.name}</h1>
        <p className="text-muted-foreground">{user?.email}</p>
        <Button variant="outline" className="mt-4">Editar Perfil</Button>
      </header>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages"><Mail className="mr-2 h-4 w-4"/> Mensagens</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4"/> Notificações</TabsTrigger>
          { (role === 'ATHLETE' || role === 'GUARDIAN') && <TabsTrigger value="videos"><Video className="mr-2 h-4 w-4"/> Meus Vídeos</TabsTrigger> }
          { role === 'PRESS' && <TabsTrigger value="articles"><Newspaper className="mr-2 h-4 w-4"/> Meus Artigos</TabsTrigger> }
          { role === 'AGENT' && <TabsTrigger value="interests"><Users className="mr-2 h-4 w-4"/> Interesses</TabsTrigger> }
        </TabsList>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Sistema de mensagens em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              <p>Sistema de notificações em breve.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {renderTabsByRole()}
      </Tabs>
    </div>
  );
}
