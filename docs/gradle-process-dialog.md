# Como lidar com a janela "Choose Process" ao atualizar o Gradle

Quando você atualiza o Gradle ou executa uma sincronização e o Android Studio abre uma janela intitulada **Choose Process**, isso significa que o IDE está tentando anexar o depurador a um processo Android em execução. Normalmente isso acontece quando a configuração selecionada na barra superior é **Attach debugger to Android process** em vez da configuração de execução padrão do aplicativo.

Para continuar o fluxo de build normalmente:

1. Feche a janela **Choose Process** clicando em **Cancel**.
2. No canto superior direito do Android Studio, ao lado do botão ▶️ **Run**, abra a lista de configurações e selecione **app** (ou a configuração principal do módulo que você quer executar).
3. Clique em **Run** (atalho `Shift + F10`). O Android Studio vai compilar o projeto e instalar o aplicativo no dispositivo/emulador escolhido.
4. Se o emulador ainda não estiver ativo, inicie-o pelo **Device Manager** antes de clicar em **Run**. Sem um dispositivo ativo não aparecerá nenhum processo na lista.
5. Caso tenha acabado de atualizar a versão do Gradle ou do Android Gradle Plugin, execute **File > Sync Project with Gradle Files** para garantir que o IDE reconheça a atualização.

Quando você realmente quiser anexar o depurador manualmente, mantenha a configuração **Attach debugger to Android process** e:

1. Inicie o aplicativo manualmente no dispositivo ou emulador.
2. Abra novamente o menu **Run > Attach debugger to Android process...**.
3. Selecione o processo listado e confirme.

Esses passos permitem alternar entre o modo de execução normal e o modo de anexar depurador, evitando ficar preso na janela **Choose Process** depois de atualizar o Gradle.
