import 'package:flutter_riverpod/flutter_riverpod.dart';

final homeProvider = NotifierProvider<HomeNotifier, int>(HomeNotifier.new);

class HomeNotifier extends Notifier<int> {
  @override
  int build() => 0;
}
